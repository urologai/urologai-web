# ADR-WORK-002 — User-controlled allowance envelopes for seed generation

- **Status:** accepted
- **Accepted by:** project owner
- **Accepted:** 2026-09-19
- **Applies to:** all three UrologAI repositories
- **Plan amendment:** `docs/plan/amendments/PLAN-001-credit-budgeted-corpus-generation.md`

## Decision

Interactive corpus generation will be divided into stable, independently verifiable batches governed by a user-selected allowance envelope. Before each session, the owner chooses a reserve floor and maximum number of batches or topics. Each batch takes read-only pre/post usage snapshots when available, commits independently, and stops before beginning another batch when the envelope is exhausted.

Agents must not predict a guaranteed credit cost, automatically consume all remaining usage, purchase credits, redeem reset credits, switch to API billing, or borrow an allowance assumption from another provider. If an allowance signal is unavailable, the safe default is one pilot batch followed by owner review.

## Rationale

Interactive product usage is variable, and the initial corpus is too large for a single opaque run. Small batches make usage measurable, let the owner decide how much weekly allowance to spend, and preserve resumable GitHub evidence without duplicate Codex/Claude Code work.

## Consequences

- Batch size is calibrated from observed usage deltas rather than a promised per-topic cost.
- `paused_budget` is a normal safe-stop state, not a failed content result.
- Quality, provenance, licensing, safety, review, and publication gates remain unchanged.
- Codex and Claude Code usage is tracked separately.
- Later API automation uses its own spend controls and does not inherit an interactive allowance envelope.
- Raw account identifiers, credential data, and reset-credit identifiers never enter Git history.
