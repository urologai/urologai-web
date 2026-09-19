# Cross-agent workflow

- **Policy version:** 1.1.0
- **Applies to:** Codex, Claude Code, humans, CI, and later automation
- **Purpose:** let multiple builders contribute without duplicating work, crossing trust boundaries, or making unrecorded deployment claims

This is the canonical repository policy. `AGENTS.md` and `CLAUDE.md` are compatibility entry points and must remain thin pointers to this file.

## 1. Start by synchronizing

Before editing, every builder must:

1. Fetch `origin` and inspect the current default-branch SHA.
2. Read `docs/BUILD_STATE.md`, the applicable block brief, and the preceding block evidence.
3. Inspect open GitHub issues, assignments, branches, and pull requests for the same block, component, or files.
4. Confirm the work is permitted by the ordered build plan and that every dependency/decision is satisfied.
5. Stop if another active claim or overlapping pull request exists. Coordinate through the existing issue rather than beginning a parallel implementation.

Do not infer ownership from an old local checkout. GitHub is the live coordination surface; the committed ledger and evidence are the durable record.

## 2. Claim one bounded work unit

Every implementation or corpus batch must have one GitHub issue or explicitly authorized block identifier. The live claim must identify:

- work/block ID and one outcome;
- assigned builder: `codex`, `claude-code`, `human`, or `ci`;
- exact repository and expected file/component scope;
- dependencies and acceptance commands;
- whether Render observation is expected to be `healthy`, `not_configured`, or `authentication_required`.

Only one builder owns a work unit at a time. A second builder may review, but must not implement the same scope. Branch names use `codex/<work-id>-<slug>` or `claude/<work-id>-<slug>`. Claims do not expire into automatic takeover. A handoff changes the issue assignment and records the prior branch/commit; it does not silently create a second implementation.

## 3. Preserve trust boundaries

- `urologai-web` contains the public application and contracts.
- `urologai-content` contains only the sanitized public release projection.
- `urologai-platform` contains private application and operational code.
- OR Prep remains a read-only donor at its pinned commit; only allowlisted files may be adapted under the copy gate.
- Never put secrets, raw private inputs, private reviewer/user data, raw source copies, or exact actionable fragments in public Git history.
- Never deploy, restart, roll back, change environment variables, or mutate DNS merely because a build ran. Those actions require their named block and explicit authorization.

## 4. Initial corpus generation

The initial background corpus may be produced interactively with Codex and Claude Code using the project owner's existing product allowances rather than runtime API calls. Evidence names this source mode `interactive_agent_allowance`, not local inference or API usage. Work is divided into non-overlapping topic batches with stable IDs.

### 4.1 Allowance envelope and budget safe stop

Before any interactive generation session, read `docs/plan/amendments/PLAN-001-credit-budgeted-corpus-generation.md` and record a user-approved provider-specific allowance envelope. The owner—not the agent—chooses the reserve floor and the maximum batch/topic count.

Take a read-only aggregate usage snapshot before and after each batch when the product exposes one. Generate, validate, commit, and receipt only one bounded stable-ID batch before deciding whether another batch fits the envelope. If the usage signal is unavailable, run at most one pilot batch and stop for owner review.

Stop with `paused_budget` before starting another batch when the reserve floor or cap is reached. Never automatically buy credits, redeem a reset, enable auto-reload, switch to API billing, consume a different provider's allowance, or weaken a quality gate. Store aggregate usage facts only; never store account IDs, credential material, billing tokens, or reset-credit identifiers.

Each batch must record source identifiers, retrieval dates, claim/citation mappings, generation policy and schema versions, model/provider identity when available, automated checks, artifact hashes, and the required AI-generation/review disclosure. Do not represent generated material as human-authored or generally clinician-reviewed.

Seed drafts remain private candidates until the applicable schemas, licensing decision, provenance controls, verifiers, release gates, and disclosures pass. Only a sanitized release projection may enter `urologai-content`. The later API pipeline remains authoritative for surveillance, incremental updates, regeneration, verification, challenge processing, and new versions. Seed material must therefore use the same IDs and schemas expected by the importer; it is not an alternate canonical store.

## 5. Build and Render observation

A **material build checkpoint** is a build, export, generation batch, migration package, container image, or other reproducible artifact that will be committed, submitted for review, or used as release evidence. Transient failed experiments need not each be committed, but their relevant failures remain in block evidence.

After every material build checkpoint and before its commit:

1. Run the repository's required tests and acceptance commands.
2. Perform a read-only Render observation for the applicable environment:
   - inspect the recorded Render service/deploy state when access exists;
   - check the public health URL when one exists;
   - compare the deployed commit/image identity when Render exposes it;
   - otherwise explicitly record `not_configured` or `authentication_required`.
3. Never create a Render token, expose credentials, trigger a deploy, restart a service, or change configuration as part of this observation.
4. Commit the implementation/artifacts after validation.
5. With a clean worktree at that exact implementation SHA, create one immutable receipt with `scripts/new-build-receipt.ps1` under `docs/build-history/`.
6. Commit only the receipt and any block ledger/evidence finalization in a follow-up evidence commit. The receipt pins the exact implementation SHA; the Git commit containing the receipt is the receipt identity.

A successful local build is not evidence that Render deployed it. A healthy Render service is not evidence that it runs the current branch. The receipt must state both facts separately.

## 6. Pull request and handoff

Before opening or updating a pull request:

- re-fetch the default branch and re-check overlapping claims/PRs;
- run acceptance commands against the exact proposed tree;
- include the block evidence and build-receipt path(s);
- list base SHA, head SHA, generated artifact hashes, Render observation, risks, rollback, and safe stopping point;
- update `docs/BUILD_STATE.md` only for facts established by evidence.

The next builder begins only from merged GitHub state and independently validates the prior evidence. A completed block never starts the next block automatically.

## 7. Commit and history conventions

- Keep commits bounded to one claimed outcome.
- Reference the work/block ID in the commit and pull-request title.
- Never rewrite shared history or force-push a branch another builder uses.
- Store every material build receipt as a new follow-up evidence commit; never edit or delete an older receipt to make current state look better.
- Correct an inaccurate receipt with a later superseding receipt that links the original.
- Development build receipts are not the signed production release receipts defined by later release-contract blocks.
