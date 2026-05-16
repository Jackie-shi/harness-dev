---
name: harness-run
description: Start autonomous development loop — picks features, implements with TDD, verifies, commits, and advances through stages until completion or exit condition.
---

# harness-run

Autonomous development loop. You pick the next feature, implement it with strict TDD, verify, commit, update progress, and repeat until an exit condition is met.

## Startup (Auto Checkin)

On every invocation, perform these steps before entering the main loop:

1. Read `.harness.yaml` from project root. Load `max_compacts` and `hitl_on_stage_boundary`.
2. Read `PROGRESS.md` from project root. Determine current position: which Stage is active, which feature was last completed, which feature is next.
3. Read `docs/roadmap.yaml`. Confirm the current Stage's `goal` and `exit_criteria`.
4. Read `AGENTS.md`. Load project constraints, tech stack context, and any special instructions.
5. Output a brief status summary to the user:
   - Format: "Currently at {stage_id}, completed {list of done features}, next up {next_feature_id}"
   - If resuming from a handoff, also show the handoff context (what was in progress, any blockers).

Initialize internal compact counter to 0.

## Main Loop

Execute this loop repeatedly until an exit condition triggers:

### Step 1: pick_feature

1. Read `docs/features.yaml`.
2. Find the next feature where `state: not_started` AND all entries in `depends_on` have `state: done`.
3. If no eligible feature exists but the current Stage is not complete, you are blocked. Trigger the "Blocked" exit condition.
4. Update that feature's `state` to `in_progress` in `docs/features.yaml`.
5. Update `PROGRESS.md` to reflect the new current feature.

WIP=1 constraint: Only one feature may be `in_progress` at any time. If you find a feature already marked `in_progress` (from a previous interrupted session), resume it rather than picking a new one.

### Step 2: implement (TDD — HARD CONSTRAINT)

TDD is non-negotiable. Every feature must follow Red-Green-Refactor:

**Red Phase:**
1. Read the feature's `behavior` and `acceptance` criteria from `docs/features.yaml`.
2. Write test(s) that encode the acceptance criteria. Tests must be specific and verifiable.
3. Run the tests. They MUST fail. If they pass without implementation, your tests are wrong — rewrite them to actually test the new behavior.

**Green Phase:**
4. Write the minimum implementation to make the tests pass.
5. Run the tests. They MUST pass. If they fail, fix the implementation (not the tests) until green.

**Refactor Phase:**
6. Review the implementation for clarity, duplication, and adherence to project conventions (from AGENTS.md).
7. Refactor if needed. Run tests again to confirm still green.

**Commit:**
8. Stage the logical unit (test + implementation together).
9. Commit with message format: `feat: <feature-id> — <what was done>`
10. If a feature requires multiple logical units (e.g., multiple acceptance criteria), repeat Red-Green-Refactor-Commit for each unit.

Rules:
- Never write implementation before a failing test exists.
- Never modify a test to make it pass — fix the implementation instead.
- One atomic commit per logical unit, not per file.
- Each commit must leave the project in a green state (all tests passing).

### Step 3: verify

Run the feature's verification commands layer by layer, as defined in `docs/features.yaml`:

1. **L1 (lint):** Run the `l1` verification command (e.g., `make check-l1`). Must pass.
2. **L2 (test):** Run the `l2` verification command (e.g., `pnpm test src/feature/__tests__/ -- --run`). Must pass.
3. **L3 (integration):** If defined, run the `l3` verification command. Must pass.

On failure at any layer:
- Read the error output carefully.
- Attempt to fix the issue (apply the same TDD discipline — don't break other tests).
- Re-run verification from the failed layer.
- If after 3 fix attempts the issue persists, trigger the "Blocked" exit condition with full error details.

On success (all layers pass):
- Update the feature's `state` to `done` in `docs/features.yaml`.
- Commit the features.yaml update: `chore: mark <feature-id> done`

### Step 4: update_progress

1. Update `PROGRESS.md`:
   - Set "Last completed" to the feature just finished, with today's date.
   - Add an entry to the History section: `[{date}] {feature_id} done — {feature_title}`
   - Update the "Feature" line to show the next candidate (or "none" if Stage is complete).

2. Check if all features in the current Stage are `done`:
   - Read `docs/roadmap.yaml` to get the feature list for the current Stage.
   - Cross-reference with `docs/features.yaml` to confirm all have `state: done`.

3. If Stage is NOT complete:
   - Loop back to Step 1 (pick_feature).

4. If Stage IS complete:
   - Verify the Stage's `exit_criteria` from `docs/roadmap.yaml`. Run any commands or checks implied by the criteria.
   - If exit_criteria pass: update the Stage's `status` to `done` in `docs/roadmap.yaml`.
   - Update `PROGRESS.md` to reflect Stage completion.
   - Commit: `chore: complete stage <stage_id>`
   - Proceed to Step 5.

### Step 5: stage_boundary_check

When a Stage is marked done:

**If `hitl_on_stage_boundary: true` (from `.harness.yaml`):**
- Output a Stage completion summary:
  - Stage ID and goal
  - All features completed in this Stage
  - Exit criteria verification results
  - What the next Stage is, its goal, and its features
- Pause and wait for user confirmation before proceeding.
- User may provide feedback, request changes, or approve continuation.

**If `hitl_on_stage_boundary: false`:**
- Output a brief one-line Stage transition notice.
- Automatically advance to the next Stage.
- Update `PROGRESS.md` to reflect the new active Stage.
- Loop back to Step 1 (pick_feature) for the next Stage.

**If no next Stage exists:**
- All Stages are done. Trigger the "All Complete" exit condition.

## Exit Conditions

### 1. All Complete

All Stages in `docs/roadmap.yaml` have `status: done`.

Actions:
- Output a project completion summary:
  - Total features implemented
  - Total Stages completed
  - Any notable decisions or deviations
- Update `PROGRESS.md` with final status.
- Commit: `chore: harness complete — all stages done`
- End with: "All goals for this version are complete. When you're ready to plan the next version, run `/harness-next`."

### 2. Blocked

An unresolvable issue prevents progress (dependency failure, ambiguous requirement, environment issue, repeated test failures after 3 fix attempts).

Actions:
- Output detailed explanation:
  - What feature was being worked on
  - What specifically failed
  - What was attempted to fix it
  - What information or action is needed from the user
- Execute handoff behavior (see below).

### 3. Compact Threshold Reached

Track compact count internally. Each time context is compacted, increment the counter. When counter reaches `max_compacts` from `.harness.yaml` (default: 3), trigger this exit.

Actions:
- Output: "Context compact limit reached ({count}/{max}). Performing handoff for session continuity."
- Execute handoff behavior (see below).
- Instruct user: "Start a new session and run `/harness-run` to continue seamlessly."

### 4. User Manual Interrupt

User interrupts the loop at any point.

Actions:
- Acknowledge the interrupt.
- Execute handoff behavior (see below).

## Handoff Behavior

On ANY exit (all four conditions above), perform these steps:

1. **Update state files:**
   - `docs/features.yaml`: ensure current feature state is accurate (in_progress if incomplete, done if finished).
   - `docs/roadmap.yaml`: ensure current Stage status is accurate.

2. **Update PROGRESS.md:**
   - Set the Current section to reflect exact position.
   - Write or overwrite the `## Handoff` section with:
     ```
     ## Handoff
     - Working on: {feature_id} — {what specifically was in progress}
     - Next step: {what needs to happen next}
     - Blockers: {any blockers, or "None"}
     - Compact count: {current_count}/{max_compacts}
     ```

3. **Commit all changes:**
   - Stage all modified files (features.yaml, roadmap.yaml, PROGRESS.md, any implementation files).
   - Commit with message: `chore: harness handoff — {current_feature_id}`

## Cross-session Recovery

When `/harness-run` is invoked in a new session:

1. The Startup phase reads `PROGRESS.md` including the Handoff section.
2. If a feature is marked `in_progress` in `docs/features.yaml`, resume it:
   - Read existing tests for that feature to understand what was already done.
   - Read the Handoff section to understand where work stopped.
   - Continue from where the previous session left off.
3. No user context is needed. The state files contain everything required to resume.

## Compact Detection

You cannot directly detect when context compaction occurs. Instead, use this heuristic:

- At the start of each feature implementation cycle, check if your internal state feels reset (you cannot recall details from earlier in the session that you previously knew).
- If you detect a compaction has occurred, increment your compact counter.
- Before each major step (pick_feature, implement, verify), re-read the relevant state files to ensure you have current information. This makes you resilient to compaction.
- When compact counter reaches `max_compacts`, trigger handoff exit immediately before starting the next feature.

## Behavioral Rules

These are hard constraints. Never violate them:

1. **WIP=1:** Only one feature may be `in_progress` at any time. Never start a second feature before the first is done or explicitly abandoned.

2. **Never skip TDD:** A failing test MUST exist before you write implementation code. A passing test MUST exist after implementation. No exceptions.

3. **Atomic commits:** One commit per logical unit of work. A logical unit is a cohesive change (e.g., one acceptance criterion implemented with its test). Never commit a half-working state. Never commit all files in one giant commit.

4. **Always update PROGRESS.md:** After every feature completion, after every Stage transition, and on every exit. PROGRESS.md is the source of truth for cross-session continuity.

5. **Respect depends_on:** If a feature's `depends_on` list contains features that are not `done`, skip it. Pick the next eligible feature. If no eligible feature exists, you are blocked.

6. **Respect exit criteria:** A Stage is not done until its `exit_criteria` are verified. Passing all feature tests is necessary but not sufficient — the exit_criteria may include integration-level or demo-level requirements.

7. **Never modify tests to make them pass:** If a test fails after implementation, the implementation is wrong. Fix the implementation, not the test. The only exception is if the test itself has a bug (wrong assertion logic, typo in expected value) — in that case, fix the test bug and document why.

8. **Commit messages follow convention:**
   - Feature work: `feat: <feature-id> — <description>`
   - State updates: `chore: mark <feature-id> done` or `chore: complete stage <stage-id>`
   - Handoff: `chore: harness handoff — <feature-id>`
