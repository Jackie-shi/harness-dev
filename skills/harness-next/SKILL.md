---
name: harness-next
description: Plan the next product version — reviews what was accomplished, then guides a deep conversation to define new features and stages for the next iteration.
---

# harness-next

You are guiding a user through planning the next version of their product. The current version is complete (or the user wants to plan ahead). Your job is to review what's been done, understand what's next, and generate updated skeleton files for the next development cycle.

---

## Phase 0: Context Load & Version Summary

### Steps

1. Read the current project state:
   - `.harness.yaml` — config
   - `PROGRESS.md` — completion status
   - `docs/features.yaml` — all features and their states
   - `docs/roadmap.yaml` — all stages and their states
   - `DECISIONS.md` — past decisions
   - `AGENTS.md` — project context

2. Present a concise summary to the user:

   > **Version Summary**
   >
   > Here's what was accomplished:
   > - **Stages completed:** S1, S2 (list goals)
   > - **Features delivered:** F01 through F05 (list titles)
   > - **Key decisions made:** D01, D02 (list briefly)
   >
   > What would you like to tackle in the next version?

3. Wait for user response before proceeding.

---

## Phase 1: Next Version Deep Conversation

### Core Principle

Same as harness-init: this is **dream extraction**, not requirements gathering. But now you have context — you know what exists, what works, what the user has already built. Use that context to ask smarter questions.

### Conversation Rules

- **One question at a time.** Never ask multiple questions in a single message.
- **Build on what exists** — reference completed features, known constraints, past decisions.
- **Follow the user's energy** — dig into what they emphasize.
- **Challenge vagueness** — same as init, do not accept fuzzy answers.
- **Make abstract concrete** — "How would that work with the existing [feature]?"

### Opening

After presenting the version summary, the user will share what they want next. Follow their thread naturally.

### Follow-up Threads

- **Evolution:** "How should [existing feature] change?", "What's missing from the current version?"
- **New capabilities:** "What can't the product do today that it should?", "What do users ask for?"
- **Motivation:** "What prompted this next version?", "What's the most important improvement?"
- **Scope:** "Is this a big leap or incremental polish?", "What's the one thing that would make the biggest difference?"

### Choice Presentation Guidelines

Follow the same guidelines as harness-init:

- **Product Form / Goal / Style choices:** Use web-search, present 5 dimensions (what it is, product impact, reference cases, best for, trade-off)
- **Technical / Feature Detail choices:** Use own knowledge, concise pros/cons

### Transition

When you understand the next version's scope, summarize and confirm:

> Here's what I understand for the next version: [summary]. Does this capture it?

After confirmation, collect:
1. **New features list** — extracted from conversation, user confirms
2. **Changes to existing features** — if any need modification (note: don't re-implement, just update behavior/acceptance)

---

## Phase 2: Requirements Refinement

Same process as harness-init Phase 2. For each new feature:

1. **Behavior** — "What does this feature do? How does the user trigger it? What's the visible result?"
2. **Acceptance Criteria** — "How do we know this is done? Give me measurable criteria."
3. **Verification Commands** — recommend appropriate layers based on existing tech stack
4. **Edge Cases** — "What if X happens?"

After all features refined:

5. **Dependencies** — propose relationships (can depend on both new AND existing features)
6. **Stage Division** — minimum viable path first, stages continue numbering from previous version
7. **Stage Goals and Exit Criteria** — for each new stage
8. **HITL Configuration** — ask if they want to keep current setting or change
9. **Compact Exit Threshold** — ask if they want to keep current setting or change

---

## Phase 3: File Operations

### Archive Current Version

Determine the version number. If no `docs/v*/` directories exist, current version is v1. Otherwise, increment.

1. Create archive directory: `docs/v{N}/`
2. Move current files:
   - `docs/features.yaml` → `docs/v{N}/features.yaml`
   - `docs/roadmap.yaml` → `docs/v{N}/roadmap.yaml`

### Generate New Version Files

3. Write new `docs/features.yaml` with the new features:
   - Feature IDs continue incrementing from the last version (if v1 ended at F05, v2 starts at F06)
   - All states set to `not_started`

4. Write new `docs/roadmap.yaml` with new stages:
   - Stage IDs continue incrementing (if v1 ended at S2, v2 starts at S3)
   - All statuses set to `not_started`

5. Update `PROGRESS.md`:
   - Keep history section (all past completions remain)
   - Reset "Current" section to new version's first stage/feature
   - Add entry: `[date] v{N+1} planning complete`

6. Update `AGENTS.md`:
   - Append new version context (new features, updated goals)
   - Do NOT remove existing content

7. Update `DECISIONS.md`:
   - Append any new decisions made during this planning session

8. Update `.harness.yaml` if user changed config values

### Commit

Commit all changes with message: `feat: harness-next — v{N+1} planning complete`

### Final Message

> v{N+1} planning is complete. Run `/harness-run` to start development.

---

## Behavioral Notes

- If the user runs `/harness-next` but the current version isn't fully complete, warn them: "The current version still has incomplete features: [list]. Are you sure you want to plan the next version now?" Proceed if they confirm.
- If `docs/features.yaml` doesn't exist, tell the user to run `/harness-init` first.
- Feature and Stage IDs always increment globally — never reset to F01/S1 for a new version. This keeps references unambiguous across versions.
