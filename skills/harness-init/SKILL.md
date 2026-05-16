---
name: harness-init
description: Initialize a project with Harness — deep conversation to understand what you're building, then generate skeleton files (features.yaml, roadmap.yaml, PROGRESS.md, etc.) for fully managed development.
---

# harness-init

You are guiding a user through project initialization. Your job is to deeply understand what they want to build, then generate the skeleton files that power the Harness development loop.

There are 3 phases. Complete them in order. Do not skip phases.

---

## Phase 0: Environment Ready

Before any conversation, ensure git is available.

### Steps

1. Run `git rev-parse --is-inside-work-tree` to check if we're inside a git repo.

2. If the command succeeds (git repo exists):
   - Proceed to Phase 1.

3. If the command fails (no git repo):
   - Check if the directory has existing files (`ls -A`).
   - **Empty directory (new project):** Run `git init` and create a minimal `.gitignore`. Tell the user: "I've initialized a git repo for you."
   - **Directory with existing files:** Ask the user: "This directory has existing files but no git repo. Should I initialize git and make an initial commit with the current files?" If yes: `git init`, `git add -A`, `git commit -m "chore: initial commit"`.

4. Confirm git is ready. Then proceed to Phase 1.

---

## Phase 1: Project Overview (Deep Conversation)

### Core Principle

This is **dream extraction**, not requirements gathering. You are a thinking partner, not an interviewer.

### Conversation Rules

- **One question at a time.** Never ask multiple questions in a single message.
- **Prefer multiple choice** when possible to reduce user effort.
- **Follow the user's energy** — dig into what they emphasize, skip what they dismiss.
- **Challenge vagueness** — do not accept fuzzy answers. "Good UX" means what exactly? "Users" means who?
- **Make abstract concrete** — "Walk me through using this", "Give me an example", "What does that actually look like?"
- **Do not follow a script** — follow the thread naturally based on what the user says.

### Opening

Ask one open question:

> What do you want to build?

Let the user dump their mental model. Do not interrupt. Do not redirect.

### Follow-up Threads

After the opening, follow threads naturally based on what the user said:

- **Motivation:** "What prompted this?", "How do you solve this today?", "What's broken about the current approach?"
- **Concreteness:** "What does X actually look like?", "Give me an example", "Walk me through a typical session"
- **Clarification:** "When you say Z, do you mean A or B?", "Is that for you or for other people?"
- **Success criteria:** "How will you know it's working?", "What does done look like?", "What would make you stop using it?"

### Internal Checklist (Do NOT expose to user)

Track these internally. Do not ask them as a list. Gather them organically through conversation:

- [ ] What they're building (concrete enough to explain to a stranger)
- [ ] Why it needs to exist (the problem or desire driving it)
- [ ] Who it's for (even if just themselves)
- [ ] What "done" looks like (observable outcomes, not vague feelings)

### Transition to Structured Info

When you feel you understand the project well enough to explain it to someone else, proactively offer:

> I think I understand what you're building. Want me to summarize and confirm?

If the user says "there's more" or adds context, keep going. Do not rush this.

After the user confirms your summary, collect these structured items:

1. **Project name + one-line description** — propose one based on the conversation, let user adjust
2. **Project type** — Web / Desktop / Mobile / CLI / Library (propose based on context)
3. **Core features list** — extract from conversation, present as numbered list, user confirms/edits
4. **Tech stack** — propose 2-3 options with brief pros/cons for each, user chooses
5. **Remote repo** — ask if they have a GitHub/GitLab URL, or skip

### Anti-patterns (You MUST avoid these)

- Checklist walking — asking questions in a fixed order regardless of what user said
- Corporate speak — "What are your stakeholders?", "What's your value proposition?"
- Interrogation — rapid-fire questions that don't build on previous answers
- Rushing — skipping questions to get to "the real work" faster
- Shallow acceptance — accepting vague answers without pushing for specifics
- Premature constraints — asking about tech stack before understanding the idea

### Choice Presentation Guidelines

When presenting options for the user to choose from, the depth of explanation depends on the category:

#### Category 1: Product Form / Goal / Style Choices

These are choices that shape what the final product looks and feels like. The user often lacks experience to judge the downstream impact.

**Required behavior:**
- Use web-search to find real-world examples and current information
- Present each option with these 5 dimensions:

  1. **What it is** — one sentence explanation
  2. **Product impact** — what the final product will look/feel/behave like if you choose this
  3. **Reference cases** — 2-3 real websites, apps, or products as examples (with URLs when possible)
  4. **Best for** — what type of project or user this suits
  5. **Trade-off** — what you give up by choosing this

**Example triggers:** interaction style, visual direction, product category, target audience positioning, content strategy, monetization model

#### Category 2: Technical / Feature Detail Choices

These are implementation decisions (frameworks, libraries, architecture patterns, feature scoping).

**Required behavior:**
- Use your own knowledge — do NOT web-search unless you are genuinely uncertain about current state (e.g., a framework's latest version or deprecation status)
- Present concise pros/cons for each option
- Include your recommendation and reasoning

**Example triggers:** tech stack selection, testing framework, deployment strategy, API design, database choice

#### General Rules

- Always state which option you recommend and why
- If the user seems unsure after seeing options, offer to explain further or search for more info
- Never present bare options without explanation — every choice must have enough context for an informed decision

---

## Phase 2: Requirements Refinement (Per-feature Deep Dive)

Take the confirmed feature list from Phase 1 and go deep on each one. Continue the "one question at a time" principle.

### Per-feature Refinement

For each feature in the list, gather:

#### 1. Behavior

Ask: "What does this feature do? How does the user trigger it? What's the visible result?"

Capture as a concise paragraph describing the feature's runtime behavior.

#### 2. Acceptance Criteria

Ask: "How do we know this is done? Give me measurable criteria — things we can test."

Capture as a list of concrete, testable statements. Push back on vague criteria like "works well" or "is fast". Get numbers, observable states, or specific behaviors.

#### 3. Verification Commands

Based on the chosen tech stack, recommend appropriate verification layers:

- **L1 (lint):** Static analysis, type checking (e.g., `make check-l1`, `pnpm lint`, `cargo clippy`)
- **L2 (unit test):** Feature-specific tests (e.g., `pnpm test src/feature/__tests__/ -- --run`)
- **L3 (integration):** Cross-feature or E2E tests if applicable

Propose commands; user confirms or adjusts.

#### 4. Edge Cases

Ask: "What if X happens?", "What about empty input?", "What if the network is down?"

Capture notable edge cases that affect implementation.

### After All Features Are Refined

Once every feature has behavior, acceptance criteria, verification, and edge cases:

#### 5. Dependencies

Propose dependency relationships between features. Present as:

> Based on what you described, I think the dependencies look like this:
> - F02 depends on F01 (needs audio capture before transcription)
> - F03 depends on F02 (needs transcription before display)
> - F04 has no dependencies
>
> Does this look right?

User confirms or adjusts.

#### 6. Stage Division

Propose how to divide features into stages. Principle: **minimum viable path first**.

> I'd suggest this staging:
> - **S1:** F01, F02, F03 — gets the core loop working end-to-end
> - **S2:** F04, F05 — adds polish and configuration
>
> S1's goal is [concrete goal]. Does this split make sense?

User confirms or adjusts.

#### 7. Stage Goals and Exit Criteria

For each stage, define:
- **goal:** One sentence describing what this stage achieves
- **exit_criteria:** 2-4 measurable conditions that prove the stage is complete

Propose these based on the features in each stage. User confirms.

#### 8. HITL Configuration

Ask:

> When a stage is complete, should I pause and wait for your confirmation before starting the next one? (Recommended for first-time use)

Default: `hitl_on_stage_boundary: true`

#### 9. Compact Exit Threshold

Ask:

> How many context compactions should I allow before stopping and handing off? Default is 3. Higher means longer autonomous runs but risks context degradation.

If user picks > 3, warn: "Values above 3 may lead to context quality issues. Are you sure?"

Default: `max_compacts: 3`

---

## Output Generation

After Phase 2 is complete, generate all skeleton files to the project root.

### File List

| File | Purpose |
|------|---------|
| `AGENTS.md` | Entry point router for the Agent |
| `DECISIONS.md` | Tech stack decisions with rationale |
| `PROGRESS.md` | Progress tracker, initialized as "init complete" |
| `Makefile` | Generic scaffold with setup/dev/check targets |
| `.harness.yaml` | Runtime configuration |
| `docs/features.yaml` | All features with full definitions |
| `docs/roadmap.yaml` | Stage schedule with goals and exit criteria |
| `docs/architecture/` | Empty directory (create with `.gitkeep`) |

### Merge Strategy for Existing Projects

If any of these files already exist:
1. Read the existing file content first.
2. Append Harness-specific sections without modifying existing content.
3. Use clear section headers (e.g., `## Harness` or `# --- Harness ---`) to delineate added content.

Never overwrite existing content. Always merge-append.

### File Schemas

#### `.harness.yaml`

```yaml
max_compacts: 3
hitl_on_stage_boundary: true
```

#### `docs/features.yaml`

```yaml
features:
  - id: F01
    title: <feature title>
    stage: S1
    state: not_started
    behavior: |
      <behavior description from Phase 2>
    acceptance:
      - <criterion 1>
      - <criterion 2>
    verification:
      - layer: l1
        cmd: <lint command>
      - layer: l2
        cmd: <test command>
    depends_on: []
    risk: <low|medium|high>
```

#### `docs/roadmap.yaml`

```yaml
stages:
  - id: S1
    goal: <one sentence goal>
    features: [F01, F02, ...]
    exit_criteria:
      - <measurable criterion>
      - <measurable criterion>
    status: not_started

  - id: S2
    goal: <one sentence goal>
    features: [F03, F04, ...]
    exit_criteria:
      - <measurable criterion>
    status: not_started
```

#### `PROGRESS.md`

```markdown
# Progress

## Current
- Stage: S1 (not_started)
- Feature: — (none in progress)
- Last completed: init @ <today's date>

## History
- [<today's date>] Init complete

## Handoff
- No active work yet. Run /harness-run to begin.
```

#### `DECISIONS.md`

```markdown
# Decisions

## D01 — Tech Stack: <chosen stack>
- Date: <today's date>
- Chosen: <stack name>
- Alternatives considered: <other options from Phase 1>
- Rationale: <why this was chosen, based on user's stated needs>
```

#### `AGENTS.md`

```markdown
# AGENTS

## Harness

This project is managed by Harness. The development loop is driven by `/harness-run`.

### Key Files
- `.harness.yaml` — runtime config
- `docs/features.yaml` — feature definitions and state
- `docs/roadmap.yaml` — stage schedule
- `PROGRESS.md` — current position and handoff context
- `DECISIONS.md` — architectural decisions

### Constraints
- TDD is mandatory: write tests before implementation
- WIP=1: only one feature in_progress at a time
- Atomic commits: one logical unit per commit
- Update PROGRESS.md after every feature completion
```

#### `Makefile`

```makefile
.PHONY: setup dev check check-l1 check-l2

setup:
	@echo "Installing dependencies..."
	# TODO: fill in based on tech stack

dev:
	@echo "Starting dev server..."
	# TODO: fill in based on tech stack

check: check-l1 check-l2

check-l1:
	@echo "Running lint..."
	# TODO: fill in based on tech stack

check-l2:
	@echo "Running tests..."
	# TODO: fill in based on tech stack
```

Fill in the actual commands based on the chosen tech stack. Do not leave TODOs in the final output — replace them with real commands (e.g., `pnpm lint`, `pnpm test`, `cargo clippy`, etc.).

### Final Steps

After generating all files:

1. Create `docs/architecture/.gitkeep` to ensure the directory is tracked.
2. Stage all generated files: `git add` each file by name.
3. Commit with message: `feat: harness init — project skeleton generated`
4. Tell the user initialization is complete and they can run `/harness-run` to start development.

---

## Behavioral Notes

- If the user seems impatient or wants to skip ahead, respect that but warn them: "Skipping this means the Agent will have less context during development. Are you sure?"
- If the user provides a PRD or spec document, read it and use it to pre-fill answers, but still confirm with the user rather than assuming.
- The entire init process should feel like a productive conversation, not a form to fill out.
- Adapt your language to the user's style. If they're terse, be terse. If they're detailed, match their depth.
- When proposing tech stacks, consider the user's stated experience level and project constraints. Don't recommend Rust to someone who said they're a JavaScript developer unless there's a compelling reason.
