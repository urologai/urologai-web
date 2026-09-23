# UrologAI contracts/v1

This directory is the immutable consumer contract frozen by B02. It contains data shapes and compatibility fixtures only; it does not implement an application, API, database, content pipeline, or deployment.

## Pinning rule

Every consumer must pin the exact lowercase SHA-256 value in `bundle.sha256`. A consumer must refuse a different digest until that exact bundle has been reviewed and its compatibility vectors pass. A matching semantic version without a matching digest is not sufficient.

The digest is calculated over the canonical JSON form of `manifest.json` after removing its `bundle_sha256` property. Object keys are sorted recursively, arrays retain their declared order, UTF-8 is used without a byte-order mark, and no trailing newline participates in the digest. The manifest then binds the SHA-256 and byte length of every governed schema, vector, and contract document other than `manifest.json` and `bundle.sha256`.

## Stable identifiers

- IDs are lowercase and case-sensitive.
- Stable object IDs are never reused for a different object.
- Revision IDs are immutable and end in `.v<positive integer>`.
- Claim IDs retain the plan form `uro.<node>.<number>`; claim revision IDs add `.v<positive integer>`.
- Opaque record IDs use a type prefix plus a 26-character Crockford Base32 ULID.
- A renamed title, label, or slug does not silently change an existing stable ID.

`schemas/identifier-set.schema.json` is the executable registry for the initial ID families.

## Independent state dimensions

`schemas/state-record.schema.json` deliberately has no generic `status` field. Topic coverage, article publication, claim state, release state, authorship, human-review scope, freshness, verification, and source integrity are independent values. Authorship never implies clinical review, and multiple narrow review records never accumulate into `full_revision` by inference.

## Public-content safety boundary

The public schemas are sanitized projections, not canonical database records.

- A public claim with `actionable: true` must omit `text` and include a fail-closed live-fragment placeholder.
- A nonactionable public claim must include its public text.
- Private contributor/reviewer identity IDs, raw sources, prompts, user queries, raw challenge submissions, credentials, and secrets have no public schema field.
- Objects reject undeclared properties unless an explicit extension point is added by a later contract version.

## Error contract

`schemas/error.schema.json` defines one closed error envelope and a stable initial code vocabulary. Messages are for people; consumers branch on `error.code`. Details contain bounded machine-safe pointers and codes, not secrets or private input echoes.

## Compatibility vectors

`vectors/index.json` declares valid and invalid examples. The dependency-free verifier resolves all local schema references, validates every vector, checks that negative fixtures fail for their declared reason, rejects unmanifested files, and reproduces the bundle digest:

```bash
node scripts/verify-contracts-v1.mjs
```

No package installation or network access is required.

## Change policy

This frozen directory is append-immutable after B02. Corrections or incompatible changes require a new contract directory and a separately claimed decision. Consumers must never follow an unpinned moving path.
