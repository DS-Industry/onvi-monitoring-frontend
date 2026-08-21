---
name: execute
description: Execute an approved ticket plan. Lead decides Split yes|no; if yes, must spawn Task subagents (not bound to a wave number).
---

# Command: Execute plan

## Invocation
`/execute`

## Description
Implements an approved kickoff plan. Reads `docs/requirements/plans/<TICKET>.plan.md`. Before implementing a ready-set of tasks, the lead **evaluates Split**, then either works solo or **must** spawn Task subagents. Not bound to a wave number.

## Parameters
- `ticket`: Ticket id (e.g. `BR-17`). Required.

## Default path
`docs/requirements/plans/<TICKET>.plan.md`

## Action

Act as `@multi-role-agent`. Follow the plan file and rule `agent-workflow`.

1. **Parse ticket id.** If missing, ask once and stop.
2. **Read** `docs/requirements/plans/<TICKET>.plan.md`. If missing, tell the user to run `/kickoff` first.
3. **Do not change the plan** unless a task is blocked; note deviations in chat.
4. **Ready-set:** take tasks whose `Depends on` outputs already exist. Do not start blocked tasks.
5. **Split decision — print in chat before any implementer work on that ready-set.** Honor the plan’s Split if still valid. Re-evaluate if files or deps changed. Do not skip. Do not bind the decision to a wave number.

   Print:

   ```
   Split: yes | no
   Ready tasks: T…
   Why: disjoint globs | same files / shared types / blocker not done
   Tracks (if yes): Track → Task type → globs
   Max agents: N (cap 3)
   ```

   **Yes** only if all are true:
   - ≥2 ready tasks
   - Allowed globs do not overlap (no shared file)
   - Each track has a Task `subagent_type` (e.g. `generalPurpose`), not `@implementation-agent`
   - No shared contract or types both tracks must edit

   User saying `spawn` **forces yes** only if those checks pass. If they fail, do not spawn; print why.

6. **If Split: yes — spawn now.** In **one** assistant message, one Task tool call per track (max 3). Lead does **not** implement those tracks — not because solo is cheaper or simpler.
   - `subagent_type` = plan **Task type**. Never pass `@agent-name` as `subagent_type`.
   - Each prompt: Follow `.cursor/agents/<name>.md`; allowed globs only; FSD excerpt; acceptance criteria; do not edit files outside globs.
   - Override yes→no only in chat: `Split overridden → no. Reason: …` (overlap, blocker, or user said solo).

7. **If Split: no — one implementer.** Lead or a single Task. Then the next ready-set.

8. After a ready-set lands: `@testing-agent` and/or `@guardrail-agent` as listed; then `@code-reviewer`.
9. **Quality gate:** `{{CONFIG.testing.typeCheckCommand}}`. Single-file tests for touched files only. No full suite / full lint unless the user confirms.
10. Summarize: files changed, leftover tasks, suggested PR notes.

## Handbook agent → Task type

Markdown agents (`@implementation-agent`, `@ui-component-agent`) are **prompt instructions**, not Task types.

| Handbook agent | Task `subagent_type` |
|----------------|----------------------|
| `@implementation-agent`, `@backend-api-agent`, `@ui-component-agent`, `@mobile-ui-agent`, `@testing-agent` | `generalPurpose` |
| `@guardrail-agent`, security | `security-review` if available, else `generalPurpose` |
| Lead `@multi-role-agent` | Do not spawn — orchestrates |

Use extra types (`explore`, …) only when they exist in the Task tool schema.

## Rules
- Never two agents on the same file.
- `Split: yes` is binding: spawn in the same turn. Do not collapse to solo.
- Follow mobile vs web split in the plan (Expo ≠ Next.js).
- No secrets or PII in logs or commit messages.

## When to Use
- After `/kickoff` and user approval of the plan file
- User says `Execute BR-17` or `/execute BR-17`

## Token Cost
High when Split is yes. Cap 3 subagents. The cap is a **limit**, not a reason to skip spawn after `Split: yes`.

## Expected Output
- **Success:** Ready-sets completed, type-check run, summary in chat
- **Failure:** Missing plan file, or blocked dependency — stop and report
