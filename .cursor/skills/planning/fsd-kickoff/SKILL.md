---
name: fsd-kickoff
description: Ticket kickoff from BRD/FSD — decompose, grade S/M/L, assemble agents and skills, write <TICKET>.plan.md after approval. Use with /kickoff or when the user names a ticket like BR-17.
---

# Skill: FSD kickoff

## Trigger
`/kickoff`, “Implement BR-17”, “plan this ticket from the FSD”, or assembling a team from BRD/FSD.

## Prerequisites
- [ ] Ticket id (e.g. `BR-17`)
- [ ] `docs/requirements/BRD.md`
- [ ] `docs/requirements/FSD.md`
- [ ] UI tickets: `DESIGN.md` (root) + mockups in `docs/design/` (optional but required when generating screens)

## Steps

1. Read BRD + FSD. For UI, also read `DESIGN.md` and matching files under `docs/design/`. Isolate the ticket slice (headings, IDs, acceptance criteria). Do not invent UI when a mockup exists.
2. Grade **S / M / L** using `rules/architecture/agent-workflow.mdc`.
3. If **S**: one implementer; skip plan file unless asked.
4. If **M / L**: decompose 5–15 tasks; assign handbook agents, Task types, allowed globs; decide **Split**.
5. Propose the team **and Split** in chat. Wait for OK.
6. Write `docs/requirements/plans/<TICKET>.plan.md` from [plan-template.md](plan-template.md).
7. Do not implement. Point to `/execute <TICKET>`. `/execute` must honor Split: if yes, spawn Task subagents — do not collapse to solo.

## Roster (assign only what the ticket needs)

| Track | Agent | Typical skills | Task type |
|-------|--------|----------------|-----------|
| Lead | `@multi-role-agent` | this skill, `task-master` | — (orchestrates) |
| Stories | `@business-requirements-agent` | — | `generalPurpose` |
| Architecture | `@architect-agent` | — | `generalPurpose` |
| Mobile UI | `@mobile-ui-agent` | `expo-router`, `gluestack-ui-v5`, `react-native-skills` | `generalPurpose` |
| Web UI | `@ui-component-agent` | `shadcn` or `antd` | `generalPurpose` |
| API | `@implementation-agent`, `@backend-api-agent` | `create-handler` | `generalPurpose` |
| Data | `@db-agent` | `create-migration` | `generalPurpose` |
| Review | `@code-reviewer` | `code-review` | `generalPurpose` |
| Security | `@guardrail-agent` | — | `security-review` if available, else `generalPurpose` |
| Tests | `@testing-agent` | — | `generalPurpose` |

## Split (not bound to a wave number)

Lead evaluates **before** implementer work on a ready-set (tasks whose deps are done).

**Yes** only if all are true: ≥2 ready tasks; disjoint globs (never the same file); Task `subagent_type` per track (e.g. `generalPurpose`, not `@implementation-agent`); no shared types both tracks must edit.

- One domain / one tree → `Split: no` (one implementer). Example: generate + send + download all in `services/billing/`.
- API + UI in different trees → `Split: yes` (max 3). Example: `services/billing/**` vs `components/features/billing/**`.

If **yes**, `/execute` **must** spawn Task calls in **one** message. Markdown agents are prompt text, not Task types. Override to no only in chat with a reason.

Waves are **dependency order** only (contracts before API/UI; tests/review last).

## Rules
- Plan in chat first; file only after approval.
- Never Expo + web frontend agents on the same mobile-only app.
- No secrets/PII in the plan file.
