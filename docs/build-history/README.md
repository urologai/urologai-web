# Build history

This directory is an append-only collection of immutable material-build receipts. Each receipt is committed in a follow-up evidence commit after the implementation/artifact commit, so it can pin the exact implementation SHA and record who built what, which checks ran, and what Render showed at that time.

## Filename

`YYYYMMDDTHHMMSSZ-<work-id>-<agent>.json`

## Required interpretation

- `build.exit_code` describes the local build or generation command.
- `render.observation_status` describes a read-only observation: `healthy`, `degraded`, `unreachable`, `not_configured`, or `authentication_required`.
- `render.deployed_revision_matches_candidate` is independent of health and may be `null` when it cannot be proven.
- `render.mutation_performed` must be `false` unless a separately authorized deployment block records the mutation elsewhere.
- `implementation_sha` is the exact clean commit that produced the validated artifact.
- `receipt_identity` is `the Git commit containing this receipt`; a receipt cannot self-embed that future commit SHA.

Never overwrite or delete a prior receipt. Add a superseding receipt and reference the earlier `receipt_id` when correcting evidence.

These are development coordination receipts, not the signed production release receipts defined by later release-contract blocks.
