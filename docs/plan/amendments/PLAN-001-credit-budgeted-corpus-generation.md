# PLAN-001 — Credit-budgeted interactive corpus generation

- **Status:** accepted plan amendment
- **Accepted by:** project owner
- **Accepted:** 2026-09-19
- **Applies to:** the one-time background/seed corpus produced with interactive Codex or Claude Code product allowances
- **Base plan:** The Living Urology Encyclopedia Build Plan v1.1, normalized SHA-256 `8f0e3fd8d30302fc7714f9ab7aa204cb814e7fda36edf54faeee7e018492f1fc`

## Amendment form

This document is a binding overlay on the frozen v1.1 plan. It does not edit or invalidate the hashed v1.1 file or the completed B00/B01 evidence. Later consolidated plan versions must incorporate this amendment without weakening it.

Official OpenAI documentation states that Codex usage varies with model, context, reasoning, tools, retrieval, and caching, and recommends checking the usage dashboard and narrowing task scope when usage is higher than expected. Therefore UrologAI does not pretend that a topic has a guaranteed credit cost. It controls consumption through small batches, provider-specific before/after usage snapshots, a user-selected reserve floor, and safe stopping points.

Reference: https://learn.chatgpt.com/docs/pricing

## Scope

This amendment governs only `interactive_agent_allowance` work used to bootstrap the initial private corpus. It does not authorize API calls, paid credits, reset redemption, production model traffic, clinical publication, Render mutation, or weaker safety and provenance gates.

Codex and Claude Code allowances are separate budget domains. Remaining usage, reset times, and observed consumption for one provider must never be assumed to apply to another.

## Required objects

Every corpus work item is one `GenerationBatch` with:

- a unique batch ID and one assigned builder;
- stable topic IDs and exact repository/path scope;
- source cutoff, source identifiers, and retrieval dates;
- schema, prompt/policy, and tool version hashes;
- a maximum topic/artifact count and acceptance commands;
- base SHA, output hashes, review status, and explicit handoff state; and
- an immutable development receipt with a read-only Render observation.

Every interactive work session has one user-approved `AllowanceEnvelope` containing:

- provider and model when known;
- snapshot time and allowance-window reset time when available;
- observed remaining percentage or credits when the product exposes them;
- `stop_at_remaining_percent`, the user-selected reserve floor;
- `max_batches` and optionally `max_topics` or `max_artifacts`;
- an expiry at the allowance reset or an earlier user-selected time; and
- whether purchased credits or reset credits may be used, which defaults to `false`.

Usage evidence stores only aggregate allowance facts needed for control. It must not store account IDs, credential material, reset-credit identifiers, billing tokens, or screenshots containing unrelated account data.

## Batch execution protocol

1. **Select an envelope.** Before generation, the project owner chooses the provider, reserve floor, and maximum batch/work-unit count. No agent chooses how much of the weekly allowance to consume on the owner's behalf.
2. **Take a read-only preflight snapshot.** Record the available aggregate usage signal and reset time. If remaining usage cannot be read reliably, run at most one pilot batch and stop for owner review.
3. **Claim exact work.** Claim one non-overlapping stable-ID batch in GitHub. A topic already claimed or generated is not regenerated unless the issue explicitly requests comparison, review, or replacement.
4. **Generate one bounded batch.** Produce schema-valid private candidates only. Run the normal provenance, citation, disclosure, safety, and deterministic validation checks; a budget boundary never relaxes a quality gate.
5. **Checkpoint durably.** Commit the batch at an exact SHA, perform the required read-only Render observation, and commit the append-only receipt/evidence update. A partially completed batch is not silently treated as complete.
6. **Measure and decide.** Take a post-batch usage snapshot when available and record the aggregate observed delta or `unknown`. Use that observation to size the next batch; do not extrapolate a guaranteed per-topic price.
7. **Stop safely.** Stop with status `paused_budget` when the reserve floor is reached, the batch cap is reached, the usage signal becomes unavailable, a reset approaches, or any acceptance gate fails. Do not start another batch automatically.
8. **Resume without duplication.** A later session resumes from the next unclaimed stable batch ID after a fresh envelope and snapshot. Claims remain owned until completed or explicitly handed off.

## Batch states

`planned → claimed → generating → generated → verified → release_eligible`

Budget stopping may enter `paused_budget` from `claimed`, `generating`, or `generated`. Correction creates a new version or `superseded` record; it does not rewrite the prior receipt.

## Non-negotiable stop rules

- Never automatically buy credits, enable auto-reload, redeem a rate-limit reset, switch to API billing, or spend a different provider's allowance.
- Never continue below the user-selected reserve floor.
- Never combine unrelated topic batches merely to use remaining credits.
- Never lower source, schema, citation, safety, licensing, or review requirements to finish within an allowance window.
- Never publish seed drafts merely because a batch was generated or credits are about to reset.
- Never treat an estimated usage delta as billing truth.

## Acceptance

This amendment is satisfied only when:

- the same amendment hash is pinned in all three repositories;
- each repository points Codex and Claude Code to the budget protocol;
- every corpus batch can be committed, verified, paused, handed off, and resumed independently;
- a user can select the reserve floor and batch cap before each session;
- receipts record provider, envelope, pre/post aggregate usage, exact batch IDs, artifact hashes, and Render observation without account secrets; and
- tests prove that exhaustion, missing usage data, or a reached reserve floor stops before the next batch.

## Relationship to the ordered plan

PLAN-001 supplements ADR-WORK-001 and the corpus-generation portions of B20–B70. It must be implemented in the batch manifest and worker/control contracts before the first interactive corpus generation batch. It creates no clinical-content milestone credit and does not start B02 or any later build block.
