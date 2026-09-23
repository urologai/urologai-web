import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contractRoot = join(repoRoot, "contracts", "v1");
const manifestPath = join(contractRoot, "manifest.json");
const bundlePath = join(contractRoot, "bundle.sha256");
const dialect = "https://json-schema.org/draft/2020-12/schema";
const namespace = "https://urologai.org/contracts/v1/";

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`Invalid JSON at ${toRepoPath(path)}: ${error.message}`);
  }
}

function toRepoPath(path) {
  return relative(repoRoot, path).split(sep).join("/");
}

function toContractPath(path) {
  return relative(contractRoot, path).split(sep).join("/");
}

function listFiles(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(path));
    else if (entry.isFile()) files.push(path);
    else fail(`Unsupported filesystem entry: ${toRepoPath(path)}`);
  }
  return files.sort((a, b) => toContractPath(a).localeCompare(toContractPath(b)));
}

function sha256(input) {
  return createHash("sha256").update(input).digest("hex");
}

function canonicalize(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    assert(Number.isFinite(value), "Canonical JSON cannot contain a non-finite number.");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
  }
  fail(`Unsupported canonical JSON value: ${typeof value}`);
}

function deepEqual(left, right) {
  return canonicalize(left) === canonicalize(right);
}

function typeMatches(value, expected) {
  const choices = Array.isArray(expected) ? expected : [expected];
  return choices.some((type) => {
    if (type === "null") return value === null;
    if (type === "array") return Array.isArray(value);
    if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
    if (type === "integer") return Number.isInteger(value);
    if (type === "number") return typeof value === "number" && Number.isFinite(value);
    return typeof value === type;
  });
}

function pointerSegment(value) {
  return String(value).replaceAll("~", "~0").replaceAll("/", "~1");
}

function resolvePointer(document, fragment, reference) {
  if (!fragment || fragment === "#") return document;
  assert(fragment.startsWith("#/"), `Only JSON Pointer fragments are supported: ${reference}`);
  let current = document;
  for (const raw of fragment.slice(2).split("/")) {
    const segment = decodeURIComponent(raw).replaceAll("~1", "/").replaceAll("~0", "~");
    assert(current !== null && typeof current === "object" && Object.hasOwn(current, segment), `Unresolved JSON Pointer ${reference}`);
    current = current[segment];
  }
  return current;
}

const schemaFiles = listFiles(join(contractRoot, "schemas")).filter((path) => path.endsWith(".json"));
const schemaById = new Map();
const schemaByPath = new Map();

for (const path of schemaFiles) {
  const schema = readJson(path);
  const contractPath = toContractPath(path);
  assert(schema.$schema === dialect, `${contractPath} must declare JSON Schema draft 2020-12.`);
  assert(typeof schema.$id === "string" && schema.$id === `${namespace}${contractPath}`, `${contractPath} has a noncanonical $id.`);
  assert(!schemaById.has(schema.$id), `Duplicate schema $id: ${schema.$id}`);
  schemaById.set(schema.$id, schema);
  schemaByPath.set(contractPath, schema);
}

function resolveReference(reference, rootSchema) {
  const absolute = new URL(reference, rootSchema.$id).href;
  const hashIndex = absolute.indexOf("#");
  const documentId = hashIndex === -1 ? absolute : absolute.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? "" : absolute.slice(hashIndex);
  const document = schemaById.get(documentId);
  assert(document, `Reference escapes or misses contracts/v1: ${absolute}`);
  return { schema: resolvePointer(document, fragment, absolute), rootSchema: document };
}

function walkReferences(value, rootSchema) {
  if (Array.isArray(value)) {
    for (const item of value) walkReferences(item, rootSchema);
    return;
  }
  if (value === null || typeof value !== "object") return;
  if (typeof value.$ref === "string") resolveReference(value.$ref, rootSchema);
  for (const child of Object.values(value)) walkReferences(child, rootSchema);
}

for (const schema of schemaById.values()) walkReferences(schema, schema);

function validate(instance, schema, rootSchema, path = "$", depth = 0) {
  assert(depth < 100, `Schema recursion limit exceeded at ${path}.`);
  if (schema === true) return [];
  if (schema === false) return [`${path}: schema is false`];
  assert(schema && typeof schema === "object" && !Array.isArray(schema), `Invalid schema node at ${path}.`);

  const errors = [];
  const nested = (value, childSchema, childRoot = rootSchema, childPath = path) => validate(value, childSchema, childRoot, childPath, depth + 1);

  if (typeof schema.$ref === "string") {
    const target = resolveReference(schema.$ref, rootSchema);
    errors.push(...nested(instance, target.schema, target.rootSchema));
  }
  if (schema.const !== undefined && !deepEqual(instance, schema.const)) errors.push(`${path}: value does not equal const`);
  if (Array.isArray(schema.enum) && !schema.enum.some((candidate) => deepEqual(instance, candidate))) errors.push(`${path}: value is not in enum`);

  if (Array.isArray(schema.allOf)) {
    for (const child of schema.allOf) errors.push(...nested(instance, child));
  }
  if (Array.isArray(schema.anyOf)) {
    const passes = schema.anyOf.filter((child) => nested(instance, child).length === 0).length;
    if (passes === 0) errors.push(`${path}: must satisfy at least one schema in anyOf`);
  }
  if (Array.isArray(schema.oneOf)) {
    const passes = schema.oneOf.filter((child) => nested(instance, child).length === 0).length;
    if (passes !== 1) errors.push(`${path}: must satisfy exactly one schema in oneOf; matched ${passes}`);
  }
  if (schema.not !== undefined && nested(instance, schema.not).length === 0) errors.push(`${path}: must not satisfy schema in not`);
  if (schema.if !== undefined) {
    const branch = nested(instance, schema.if).length === 0 ? schema.then : schema.else;
    if (branch !== undefined) errors.push(...nested(instance, branch));
  }

  if (schema.type !== undefined && !typeMatches(instance, schema.type)) {
    errors.push(`${path}: expected type ${JSON.stringify(schema.type)}`);
    return errors;
  }

  if (typeof instance === "string") {
    if (schema.minLength !== undefined && [...instance].length < schema.minLength) errors.push(`${path}: must contain at least ${schema.minLength} characters`);
    if (schema.maxLength !== undefined && [...instance].length > schema.maxLength) errors.push(`${path}: must contain at most ${schema.maxLength} characters`);
    if (schema.pattern !== undefined && !new RegExp(schema.pattern, "u").test(instance)) errors.push(`${path}: must match pattern ${schema.pattern}`);
    if (schema.format === "date") {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(instance);
      const parsed = match ? new Date(`${instance}T00:00:00Z`) : null;
      const normalized = parsed && !Number.isNaN(parsed.valueOf()) ? parsed.toISOString().slice(0, 10) : "";
      if (!match || normalized !== instance) errors.push(`${path}: invalid date format`);
    }
    if (schema.format === "date-time") {
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(instance) || Number.isNaN(Date.parse(instance))) {
        errors.push(`${path}: invalid date-time format`);
      }
    }
  }

  if (typeof instance === "number" && Number.isFinite(instance)) {
    if (schema.minimum !== undefined && instance < schema.minimum) errors.push(`${path}: must be >= ${schema.minimum}`);
    if (schema.maximum !== undefined && instance > schema.maximum) errors.push(`${path}: must be <= ${schema.maximum}`);
  }

  if (Array.isArray(instance)) {
    if (schema.minItems !== undefined && instance.length < schema.minItems) errors.push(`${path}: must contain at least ${schema.minItems} items`);
    if (schema.maxItems !== undefined && instance.length > schema.maxItems) errors.push(`${path}: must contain at most ${schema.maxItems} items`);
    if (schema.uniqueItems === true && new Set(instance.map(canonicalize)).size !== instance.length) errors.push(`${path}: items must be unique`);
    if (schema.items !== undefined) {
      instance.forEach((item, index) => errors.push(...nested(item, schema.items, rootSchema, `${path}/${index}`)));
    }
  }

  if (instance !== null && typeof instance === "object" && !Array.isArray(instance)) {
    if (Array.isArray(schema.required)) {
      for (const key of schema.required) {
        if (!Object.hasOwn(instance, key)) errors.push(`${path}: missing required property '${key}'`);
      }
    }
    const properties = schema.properties ?? {};
    for (const [key, value] of Object.entries(instance)) {
      const childPath = `${path}/${pointerSegment(key)}`;
      if (Object.hasOwn(properties, key)) errors.push(...nested(value, properties[key], rootSchema, childPath));
      else if (schema.additionalProperties === false) errors.push(`${path}: additional property '${key}' is not allowed`);
      else if (schema.additionalProperties && typeof schema.additionalProperties === "object") errors.push(...nested(value, schema.additionalProperties, rootSchema, childPath));
    }
  }

  return errors;
}

assert(existsSync(manifestPath), "Missing contracts/v1/manifest.json.");
assert(existsSync(bundlePath), "Missing contracts/v1/bundle.sha256.");
const manifest = readJson(manifestPath);
assert(manifest.schema_version === "1.0.0", "Manifest schema_version mismatch.");
assert(manifest.contract_version === "1.0.0", "Manifest contract_version mismatch.");
assert(manifest.json_schema_dialect === dialect, "Manifest dialect mismatch.");
assert(manifest.namespace === namespace, "Manifest namespace mismatch.");
assert(Array.isArray(manifest.files) && manifest.files.length > 0, "Manifest file inventory is empty.");
assert(/^[a-f0-9]{64}$/.test(manifest.bundle_sha256 ?? ""), "Manifest bundle_sha256 is invalid.");

const declaredPaths = manifest.files.map((entry) => entry.path);
assert(new Set(declaredPaths).size === declaredPaths.length, "Manifest contains duplicate paths.");
assert(declaredPaths.join("\n") === [...declaredPaths].sort().join("\n"), "Manifest paths are not sorted.");
for (const entry of manifest.files) {
  assert(typeof entry.path === "string" && !entry.path.startsWith("/") && !entry.path.includes("\\") && !entry.path.split("/").includes(".."), `Unsafe manifest path: ${entry.path}`);
  assert(/^[a-f0-9]{64}$/.test(entry.sha256 ?? ""), `Invalid manifest hash: ${entry.path}`);
  assert(Number.isInteger(entry.size_bytes) && entry.size_bytes >= 0, `Invalid manifest size: ${entry.path}`);
  const path = join(contractRoot, ...entry.path.split("/"));
  assert(existsSync(path) && statSync(path).isFile(), `Manifest file is missing: ${entry.path}`);
  const bytes = readFileSync(path);
  assert(bytes.length === entry.size_bytes, `Manifest size mismatch: ${entry.path}`);
  assert(sha256(bytes) === entry.sha256, `Manifest hash mismatch: ${entry.path}`);
}

const actualGovernedPaths = listFiles(contractRoot)
  .map(toContractPath)
  .filter((path) => path !== "manifest.json" && path !== "bundle.sha256");
assert(actualGovernedPaths.join("\n") === declaredPaths.join("\n"), "Manifest does not exactly cover governed contract files.");

const digestInput = structuredClone(manifest);
delete digestInput.bundle_sha256;
const reproducedBundleSha = sha256(Buffer.from(canonicalize(digestInput), "utf8"));
assert(reproducedBundleSha === manifest.bundle_sha256, "Manifest bundle_sha256 is not reproducible.");
assert(readFileSync(bundlePath, "utf8").trim() === manifest.bundle_sha256, "bundle.sha256 does not match the manifest.");

const vectorIndexPath = join(contractRoot, "vectors", "index.json");
const vectorIndex = readJson(vectorIndexPath);
assert(vectorIndex.contract_version === manifest.contract_version, "Vector contract version mismatch.");
assert(Array.isArray(vectorIndex.cases) && vectorIndex.cases.length > 0, "No compatibility vectors are declared.");
assert(new Set(vectorIndex.cases.map((item) => item.id)).size === vectorIndex.cases.length, "Duplicate compatibility vector ID.");

const declaredVectorFiles = vectorIndex.cases.map((item) => item.instance).sort();
const actualVectorFiles = actualGovernedPaths.filter((path) => path.startsWith("vectors/valid/") || path.startsWith("vectors/invalid/")).sort();
assert(declaredVectorFiles.join("\n") === actualVectorFiles.join("\n"), "Vector index does not exactly cover valid/invalid fixtures.");

let validCount = 0;
let invalidCount = 0;
for (const item of vectorIndex.cases) {
  assert(typeof item.id === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id), `Invalid vector ID: ${item.id}`);
  assert(typeof item.valid === "boolean", `Vector ${item.id} lacks a boolean valid expectation.`);
  const schema = schemaByPath.get(item.schema);
  assert(schema, `Vector ${item.id} references an unknown schema: ${item.schema}`);
  const instancePath = join(contractRoot, ...item.instance.split("/"));
  assert(existsSync(instancePath), `Vector ${item.id} instance is missing.`);
  const errors = validate(readJson(instancePath), schema, schema);
  if (item.valid) {
    validCount += 1;
    assert(errors.length === 0, `Expected ${item.id} to pass:\n${errors.join("\n")}`);
  } else {
    invalidCount += 1;
    assert(errors.length > 0, `Expected ${item.id} to fail.`);
    assert(typeof item.expected_error === "string" && errors.some((error) => error.includes(item.expected_error)), `Vector ${item.id} did not fail for '${item.expected_error}':\n${errors.join("\n")}`);
  }
}
assert(validCount >= 7 && invalidCount >= 7, "Compatibility matrix is unexpectedly small.");

const actionableValid = readJson(join(contractRoot, "vectors", "valid", "public-claim-actionable-placeholder.json"));
assert(actionableValid.actionable === true && !Object.hasOwn(actionableValid, "text") && actionableValid.placeholder?.fail_closed === true, "Valid actionable vector is not fail-closed.");

const summary = {
  result: "pass",
  contract_version: manifest.contract_version,
  bundle_sha256: manifest.bundle_sha256,
  governed_files: manifest.files.length,
  schemas: schemaFiles.length,
  valid_vectors: validCount,
  invalid_vectors: invalidCount,
  external_references: 0,
  dependencies_installed: 0,
  actionable_public_text_in_valid_vectors: false
};

console.log(JSON.stringify(summary, null, 2));
