# UrologAI Web build state

## Identity

| Field | Value |
|---|---|
| Product | UrologAI — The Living Urology Encyclopedia |
| Repository | `urologai/urologai-web` |
| Visibility | public |
| Default branch | `main` |
| Role | Public web application, public contracts, methods, disclosures, and later GitHub Pages workflow |
| Public hostname | `urologai.org` |
| API hostname | `api.urologai.org` |
| Staff hostname | `staff.urologai.org` |

## Plan and decision pins

- Build plan: v1.1, normalized SHA-256 `8f0e3fd8d30302fc7714f9ab7aa204cb814e7fda36edf54faeee7e018492f1fc`.
- D01: UrologAI naming, the `urologai` organization, three-repository topology, domains, and neutral independent identity are accepted.
- ADR-WORK-001: initial background work uses claimed Codex/Claude Code batches and immutable build/Render receipts; the later API pipeline owns updates.
- PLAN-001: interactive corpus generation uses user-selected allowance envelopes, one independently committable batch at a time, and a `paused_budget` safe stop.
- ADR-WORK-002: agents may not spend below the reserve floor, automatically buy credits, redeem resets, or switch to API billing.
- ADR-WORK-003: Dr. Donald Neff (`nocluetoday`) is an authorized build collaborator with repository-scoped write access after invitation acceptance; this is not organization administration or production authority.
- Historical plan references to `urowiki-web` resolve to this repository.

## Block ledger

| Block | Status | Outcome | Evidence | Next permitted block |
|---|---|---|---|---|
| `B01` | bootstrap complete | Establish the repository with one governance-only initial commit | Root B01 handoff manifest pins this commit | `B02`, after independent root-manifest validation |
| `PLAN-001` | complete | Add credit-budgeted, resumable corpus batches without changing frozen plan v1.1 | `docs/build-history/20260919T194616Z-PLAN-001-codex.json` pins implementation `f319ac7bb22346c3fd5eeec9415f06504fbf8cf7` | `B02`, after independent PLAN-001 receipt validation |
| `GOV-001` | complete | Add the explicit independent-builder runbook and authorize Dr. Neff's bounded collaborator role | `docs/build-history/20260919T201140Z-GOV-001-codex.json` pins implementation `77a9e1251be5b1792541859a7e8cab55d92c067c` | `B02`, after independent GOV-001 receipt validation |

The immutable initial commit SHA, numeric GitHub repository ID, node ID, and remote settings are recorded outside this self-referential commit in the B01 root handoff manifest.

## Initial control state

- Rulesets and branch protection: none at B01; later named provisioning blocks establish them.
- License: intentionally unresolved; no license file is present.
- Clinical content, product code, dependencies, workflows, secrets, donor source, DNS changes, and deployments: absent.
- Render target: not configured for this repository; material builds must still write a receipt recording `not_configured` until that changes.
- Live GitHub permissions determine whether Dr. Neff's repository invitation is pending or accepted. No organization-owner, repository-admin, deployment, environment, secret, billing, DNS, or release authority is granted by GOV-001.
- The legacy `jfantus/urowiki` prototype and `nocluetoday/OR_Prep` are outside this repository and remain unmodified.
