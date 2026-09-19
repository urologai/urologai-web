# UrologAI Web

**Repository:** `urologai/urologai-web`
**Visibility:** public
**Product:** UrologAI — The Living Urology Encyclopedia

Public application, versioned public contracts, methods, disclosures, and the later protected static-site workflow.

> Stop before editing if you have not claimed a bounded GitHub issue. GitHub `main`, open issues, open pull requests, and the committed ledger—not a local checkout or chat—define current project state.

## Current status

### Completed

- **B00 — governance and donor gate:** the build plan and exact OR Prep donor commit were pinned; reuse authority, license/provenance, an exact file/blob allowlist, and scans were recorded. OR Prep remains read-only and no donor implementation was copied.
- **D01 — identity and topology:** UrologAI, the `urologai` organization, the three repositories, their visibility, and the public/API/staff hostnames were accepted.
- **B01 — repository trust boundaries:** all three repositories were created with governance-only bootstrap commits. No clinical content or implementation was included.
- **ADR-WORK-001 — agent-assisted seed boundary:** Codex and Claude Code may produce private, schema-valid initial seed batches; the later API pipeline owns continuing updates.
- **PLAN-001 and ADR-WORK-002 — allowance control:** the owner chooses the provider, reserve floor, and maximum work units; generation proceeds one stable-ID batch at a time and stops as `paused_budget` before exceeding the envelope.
- **GOV-001 — collaborator runbook:** this README and the canonical workflow define how the project owner, Dr. Neff, Codex, and Claude Code work independently without overlapping changes.

### Not started

- **B02 has not started.** No `contracts/v1` bundle exists yet.
- No clinical or educational corpus has been generated, reviewed, exported, or published.
- No application framework, dependency tree, migration, database, worker, API route, or production workflow has been added.
- No new Render service, deployment, environment variable, credential, GitHub Pages release, DNS change, or production domain cutover has occurred.
- No OpenAI/Anthropic/OpenRouter API billing has been enabled for this build, and no interactive reset or paid credit was consumed by these governance changes.
- The existing `urologai.org` site remains a quarantined nonclinical legacy prototype and is not evidence that the planned system exists.

## Repository boundaries

| Repository | Visibility | Owns | Must never contain |
|---|---|---|---|
| [`urologai-web`](https://github.com/urologai/urologai-web) | Public | Contracts, public application, methods/disclosures, later protected static build | Private drafts/data, secrets, source copies, actionable text that must remain live-gated |
| [`urologai-content`](https://github.com/urologai/urologai-content) | Public | Sanitized current release projection only | Raw seed drafts, private reviewer/user data, prompts, source text, secrets |
| [`urologai-platform`](https://github.com/urologai/urologai-platform) | Private | Platform, staff tools, pipelines, private working revisions, later Render configuration | Public-release authority, secrets in Git, unauthorized donor copies |

**This repository may contain:** Governance now; `contracts/v1` beginning in B02; later public application code and sanitized build inputs only after their named blocks.

**This repository must not contain:** Clinical drafts, private data, source copies, secrets, private reviewer information, exact actionable fragments, platform code, or Render credentials.

## People and authority

| Actor | GitHub identity | Permitted role |
|---|---|---|
| Project owner | [`jfantus`](https://github.com/jfantus) | Final project decisions and explicit approval of named external-state, spend, credential, deployment, or production changes |
| Dr. Donald Neff | [`nocluetoday`](https://github.com/nocluetoday) | Authorized build collaborator on claimed UrologAI branches and pull requests after accepting the repository invitation |
| Codex | Recorded as `codex` | Implements only its claimed issue/path scope and follows `AGENTS.md` |
| Claude Code | Recorded as `claude-code` | Implements only its claimed issue/path scope and follows `CLAUDE.md` |

Dr. Neff owns the separate `nocluetoday/OR_Prep` donor repository. UrologAI permission does **not** authorize anyone to push, open branches or issues, change settings, deploy, or otherwise mutate OR Prep. Only the exact B00 allowlist may later be adapted into UrologAI after the applicable block is claimed.

No collaborator should share a password, passkey, one-time code, personal access token, API key, or Render credential with another person or agent.

## Required reading before every change

Read these in order:

1. This README.
2. [`AGENTS.md`](AGENTS.md) when using Codex, or [`CLAUDE.md`](CLAUDE.md) when using Claude Code.
3. [`docs/coordination/AGENT_WORKFLOW.md`](docs/coordination/AGENT_WORKFLOW.md), the canonical workflow.
4. [`docs/BUILD_STATE.md`](docs/BUILD_STATE.md), the repository ledger.
5. [`PLAN-001`](docs/plan/amendments/PLAN-001-credit-budgeted-corpus-generation.md) for interactive corpus work.
6. [`ADR-WORK-001`](docs/decisions/ADR-WORK-001.md), [`ADR-WORK-002`](docs/decisions/ADR-WORK-002.md), and [`ADR-WORK-003`](docs/decisions/ADR-WORK-003.md).
7. The claimed issue, its dependencies, the preceding block evidence, and every open issue/branch/pull request touching the same paths or stable topic IDs.

## Independent-builder procedure

### 1. Synchronize—never start from an old checkout

```bash
git clone https://github.com/urologai/urologai-web.git
cd urologai-web
git fetch --all --prune
git switch main
git pull --ff-only origin main
```

Then inspect:

- [open issues](https://github.com/urologai/urologai-web/issues);
- [open pull requests](https://github.com/urologai/urologai-web/pulls);
- remote branches; and
- the latest committed build ledger and receipts.

### 2. Claim one bounded work unit

Do not edit until one GitHub issue records:

- one work/block ID and one outcome;
- assigned builder (`human`, `codex`, or `claude-code`);
- exact repository, files/components, and stable topic IDs;
- base `main` SHA;
- dependencies and acceptance commands;
- permitted external mutations and spend; and
- expected Render observation (`not_configured` until a later deployment block says otherwise).

If another issue, branch, or pull request overlaps, stop and coordinate there. Claims do not expire into automatic takeover; reassignment requires an explicit handoff.

### 3. Create only your branch

```bash
git switch -c human/<work-id>-<short-description>       # Dr. Neff or another human
git switch -c codex/<work-id>-<short-description>       # Codex
git switch -c claude/<work-id>-<short-description>      # Claude Code
```

Never commit directly to `main`, force-push shared history, reuse another builder’s branch, or combine unrelated work IDs.

### 4. Build only the claimed scope

- Keep changes inside the listed paths and repository boundary.
- Do not start the next block automatically.
- Preserve stable IDs and existing evidence; corrections supersede rather than rewrite receipts.
- For interactive corpus work, obey the user-selected allowance envelope and complete only one batch before checking usage again.
- Stop rather than guessing when a dependency, decision, license, source permission, schema, or safety rule is missing.

### 5. Validate and create two commits

1. Run the issue’s tests and acceptance commands.
2. Perform the required **read-only** Render observation. `not_configured` is the honest current result.
3. Commit the implementation or documentation at an exact SHA.
4. Confirm the worktree is clean.
5. Run `scripts/new-build-receipt.ps1` for that implementation SHA.
6. Commit only the append-only receipt plus ledger/evidence finalization in a second commit.

A local build never proves Render deployed it. A Render observation never authorizes a deploy, restart, environment change, token creation, or DNS mutation.

### 6. Open the pull request and hand off

The pull request must list:

- issue/work ID and exact scope;
- base, implementation, receipt, and proposed head SHAs;
- acceptance results and artifact hashes;
- Render status and `mutation_performed`;
- risks, rollback, and safe stopping point;
- whether another repository is part of the handoff; and
- the next block that is permitted—but not automatically started.

Merge only after the exact GitHub state is rechecked. The next builder starts from merged `main` and independently validates the prior receipt.

## Current next work

`B02` in this repository: freeze `contracts/v1` identifiers, errors, state/authorship/review/status schemas, public-content JSON Schemas, compatibility vectors, and an immutable bundle hash. B02 has not started.

Do not add UI, clinical content, deployment workflows, DNS, Pages configuration, or application dependencies as part of B02.

## Hard stop rules

Stop and comment on the claimed issue if any of these occurs:

- the base SHA changed or an overlapping claim/PR appears;
- required evidence, source permission, schema, decision, or review is missing;
- a secret, private data, source copy, or disallowed clinical/actionable text would enter Git;
- an action would mutate Render, DNS, GitHub permissions/rules, credentials, spend, deployment, or another repository without explicit authorization;
- the selected corpus allowance reserve or batch cap is reached, or usage cannot be read after one pilot batch;
- a test, scan, provenance check, receipt check, or safety gate fails; or
- the requested work belongs to another repository or later block.

When uncertain, stop safely. A smaller verified handoff is correct; an unclaimed “helpful” expansion is not.

## Canonical coordination references

- [Cross-agent workflow](docs/coordination/AGENT_WORKFLOW.md)
- [Repository build ledger](docs/BUILD_STATE.md)
- [Credit-budget plan amendment](docs/plan/amendments/PLAN-001-credit-budgeted-corpus-generation.md)
- [Collaborator access decision](docs/decisions/ADR-WORK-003.md)
- [Build-history format](docs/build-history/README.md)
- [Receipt template](docs/build-history/receipt-template.json)

Canonical public hostname: `urologai.org`. API and staff hostnames are `api.urologai.org` and `staff.urologai.org`; none is a collaborator sandbox or authorization to deploy.
