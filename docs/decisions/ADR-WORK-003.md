# ADR-WORK-003 — Collaborator access and independent-build boundary

- **Status:** accepted
- **Accepted by:** project owner
- **Accepted:** 2026-09-19
- **Collaborator:** Dr. Donald Neff
- **GitHub identity:** `nocluetoday`
- **Applies to:** all three UrologAI repositories

## Decision

Dr. Neff is an authorized UrologAI build collaborator. Repository-scoped write invitations may be issued for `urologai-web`, `urologai-content`, and `urologai-platform` so he can create claimed branches and pull requests.

The permission is intentionally narrower than organization owner or administrator. It does not grant production deployment, environment, secret, billing, DNS, repository-administration, ruleset, credential, or release authority.

Every collaborator—including the project owner—uses the same issue claim, non-overlap check, branch, validation, receipt, pull-request, and handoff protocol. Direct commits to `main` and force-pushes to shared history are prohibited.

## OR Prep boundary

The `nocluetoday/OR_Prep` repository remains the read-only donor pinned by B00. Dr. Neff's UrologAI collaboration does not authorize Codex, Claude Code, the project owner, or another collaborator to mutate OR Prep. Donor adaptation remains limited to the exact B00 allowlist and later claimed blocks.

## Clinical and review boundary

Build collaboration is not evidence of clinical review. No contribution is labeled as Dr. Neff-reviewed, SME-reviewed, or human-reviewed without the plan's separate identity, scope, conflict-of-interest, checklist, decision, and attribution records.

## Access lifecycle

- Invitations are accepted through GitHub; passwords, passkeys, one-time codes, tokens, and credentials are never shared.
- Access is reviewed when the collaborator's role changes or a security concern arises.
- Removing repository access does not rewrite prior attributed Git history or receipts.
- Any broader role requires a new accepted decision and explicit project-owner authorization.
