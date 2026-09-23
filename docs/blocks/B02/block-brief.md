# B02 — Freeze contracts/v1

- **Status:** implementation complete; pending receipt, review, and merge
- **Claim:** [urologai/urologai-web#5](https://github.com/urologai/urologai-web/issues/5)
- **Assigned builder:** `codex`
- **Base repository:** `urologai/urologai-web`
- **Base main SHA:** `606d486518358fd5f8d365e5f9d772bfefe7634e`
- **Branch:** `codex/B02-contracts-v1`
- **Dependency:** B01 complete; GOV-001 verified before the claim
- **Bundle SHA-256:** `6871f8df8cd125ca5e5162a40e226df22808bb7ce6f542df84fe7fb960960e70`

## Bounded outcome

Freeze a consumer-neutral `contracts/v1` bundle containing:

1. canonical stable-ID formats;
2. typed error codes and an error-envelope schema;
3. separate state, authorship, human-review, freshness, verification, integrity, and status vocabularies;
4. sanitized public claim, article, and release JSON Schemas;
5. positive and negative compatibility vectors;
6. a dependency-free verifier; and
7. a deterministic manifest and immutable bundle hash for pinned consumers.

The bundle is a compatibility contract, not a server, database model, UI, release receipt protocol, or clinical corpus.

## Permitted paths

- `contracts/v1/**`
- `scripts/verify-contracts-v1.mjs`
- `docs/blocks/B02/block-brief.md`
- `README.md`
- `docs/BUILD_STATE.md`
- `docs/build-history/<B02 receipt>.json`
- root coordination artifacts under `docs/blocks/B02/**` and root `BUILD_STATE.md`

## Contract constraints

- JSON Schemas use draft 2020-12 and closed object shapes unless an extension point is explicit.
- Authorship and human review remain independent dimensions.
- Article, claim, topic-coverage, release, freshness, integrity, and challenge values never share one ambiguous status field.
- Exact actionable claim text is forbidden in a public claim object; only a stable ID, digest, provenance/status metadata, and fail-closed placeholder may be exported.
- Public objects contain no private contributor/reviewer identity IDs, raw source copies, prompts, user queries, challenge submissions, credentials, or secrets.
- Schema identifiers and references remain inside the immutable `https://urologai.org/contracts/v1/` namespace.
- The manifest hashes every governed contract/vector file. The bundle hash is reproducible without hashing itself.

## Explicit exclusions

No UI, application framework, clinical or educational prose, donor-code adaptation, content generation, API/server implementation, database, dependency installation, GitHub workflow, Pages configuration, deployment, Render mutation, DNS, credential, billing, or production change. OR Prep remains read-only.

## Acceptance

- `node scripts/verify-contracts-v1.mjs`
- `git diff --check`
- every declared valid vector passes and every declared invalid vector fails;
- all schema references resolve inside `contracts/v1`;
- every manifest digest and the bundle digest reproduce exactly;
- no exact actionable clinical text, private data, source copy, or secret is present;
- Render is recorded as `not_configured` with `mutation_performed=false`;
- the implementation is one commit, followed by an append-only receipt/ledger commit; and
- the reviewed pull request merges before root handoff evidence is frozen.

## Safe stop

B02 stops after the exact merged contract bundle, receipt, and root verifier are pinned. B03 and every implementation/content/deployment block require a new claim and do not start automatically.
