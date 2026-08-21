---
name: kickoff
description: Ticket intake from BRD/FSD — grade S/M/L, assemble agents and skills, wait for OK, then write <TICKET>.plan.md. Does not implement.
---

# Command: Kickoff

## Invocation
`/kickoff`

## Description
Team-lead intake for a named ticket (e.g. `Implement BR-17`). Reads BRD and FSD, grades the work, proposes a team, and writes a plan file **only after** the user confirms. Does **not** implement code.

## Parameters
- `ticket`: Ticket id from the user message (e.g. `BR-17`, `TICKET BR-17`). Required.
- `docs`: Override paths if not using defaults.

## Default paths
- BRD: `docs/requirements/BRD.md`
- FSD: `docs/requirements/FSD.md`
- Design (UI, optional): `DESIGN.md` (root) or `docs/requirements/DESIGN.md`. Mockups: `docs/design/`
- Plan output: `docs/requirements/plans/<TICKET>.plan.md`

## Action

Act as `@multi-role-agent`. Follow skill `fsd-kickoff` for the plan template and roster. Follow rule `agent-workflow` for S/M/L.

1. **Parse ticket id** from the user text (e.g. `BR-17`). If missing, ask once and stop.
2. **Read** BRD and FSD (and `DESIGN.md` + `docs/design/` if UI). If a required file is missing, stop and ask for the path. Do not invent UI when a mockup exists in `docs/design/`.
3. **Isolate** only the slice that matches the ticket. Quote FSD section headings used.
4. **Grade** S / M / L (see `rules/architecture/agent-workflow.mdc`).
   - **S:** Recommend one implementer (`Split: no`). Do **not** assemble a full team. Do **not** write a plan file unless the user asks. Stop.
5. **Decompose** 5–15 tasks. Assign handbook agents, Task types (`generalPurpose`, …), and **allowed globs**.
6. **Split decision** (not bound to a wave number):
   - `yes` only if ≥2 tasks have **disjoint globs**, no shared types/contracts, and each track has a Task type (not `@implementation-agent` as `subagent_type`).
   - One domain / one tree (e.g. all under `services/billing/`) → `Split: no` — one implementer.
   - API + UI in different trees → `Split: yes` (max 3 tracks).
7. **Print in chat** (do not write files yet):
   - Goal (one sentence)
   - Grade
   - Out of scope
   - Team (handbook agent + Task type + skills)
   - Split (`yes` / `no` + reason)
   - Tracks (if yes: globs + Task type)
   - Waves (dependency order only)
   - Risks
8. **Ask:** `OK to write docs/requirements/plans/<TICKET>.plan.md?`
9. **On explicit approval only:** write the plan using the template in `skills/planning/fsd-kickoff/plan-template.md`.
10. **Stop.** Ask: `Execute this plan?` (user can run `/execute <TICKET>`).

## Rules
- **Do not implement** in this command.
- Do not spawn subagents until `/execute`.
- Do not create a plan file before the user says OK.
- Mobile vs web: `@mobile-ui-agent` vs `@ui-component-agent` — never both on the same app unless dual-target.
- No secrets, PII, or internal hostnames in the plan.
- No full lint or full test suite.

## When to Use
- Starting a ticket from BRD/FSD (`/kickoff Implement BR-17`)
- Multi-file or multi-track work (tier M or L)
- Assembling who should work a ticket before coding

## Token Cost
~8–20K tokens (reads two docs + plan). Do not pull unrelated files.

## Expected Output
- **Success (M/L):** Chat proposal → after OK, `docs/requirements/plans/<TICKET>.plan.md`
- **Success (S):** One-implementer recommendation; no plan file
- **Failure:** Missing ticket id or missing BRD/FSD — ask and stop
