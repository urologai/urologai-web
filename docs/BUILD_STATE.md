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
- Historical plan references to `urowiki-web` resolve to this repository.

## Block ledger

| Block | Status | Outcome | Evidence | Next permitted block |
|---|---|---|---|---|
| `B01` | bootstrap complete | Establish the repository with one governance-only initial commit | Root B01 handoff manifest pins this commit | `B02`, after independent root-manifest validation |

The immutable initial commit SHA, numeric GitHub repository ID, node ID, and remote settings are recorded outside this self-referential commit in the B01 root handoff manifest.

## Initial control state

- Rulesets and branch protection: none at B01; later named provisioning blocks establish them.
- License: intentionally unresolved; no license file is present.
- Clinical content, product code, dependencies, workflows, secrets, donor source, DNS changes, and deployments: absent.
- Render target: not configured for this repository; material builds must still write a receipt recording `not_configured` until that changes.
- The legacy `jfantus/urowiki` prototype and `nocluetoday/OR_Prep` are outside this repository and remain unmodified.
