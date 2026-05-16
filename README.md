# harness-dev

**Tell it what to build. It builds it.**

A skills-only plugin for Claude Code and Codex that turns a conversation into a fully managed development project — from idea to working code, autonomously.

```bash
npx harness-dev
```

---

## Why This Exists

AI coding assistants are powerful, but they still need you to drive. You break down tasks, decide what's next, remember where you left off, and keep things on track across sessions.

Harness flips that. You describe what you want to build — once — and the agent takes over: planning features, writing tests first, implementing, verifying, committing, and picking up exactly where it left off next session. You make decisions at the moments that matter. The agent handles everything else.

No CLI. No config files to hand-write. No project management overhead. Just a conversation that turns into working software.

## How It Works

```
/harness-init  →  /harness-run  →  (complete)  →  /harness-next  →  /harness-run  →  ...
```

### 1. Init — One deep conversation

You talk about what you want to build. The agent digs in — challenges vague ideas, proposes tech stacks with real trade-offs, breaks features into testable units, and stages them into a minimum viable path.

Output: a set of skeleton files (`features.yaml`, `roadmap.yaml`, `PROGRESS.md`, etc.) that encode your entire project plan.

### 2. Run — Fully autonomous development

The agent reads the plan and executes. For each feature:

- Picks the next eligible feature (respects dependencies, WIP=1)
- Writes tests first (TDD, always)
- Implements until tests pass
- Runs verification layers (lint → unit → integration)
- Commits atomically
- Updates progress and moves to the next

It keeps going until a stage is done, then optionally pauses for your review. If the context gets long, it hands off cleanly and picks up in the next session.

### 3. Next — Plan the next version

When all stages are complete, run `/harness-next`. The agent reviews what was built, then guides another deep conversation to define the next iteration. Old files get archived, new features get planned, and `/harness-run` picks up the new work.

---

## Commands

| Command | What it does |
|---------|-------------|
| `/harness-init` | Deep conversation → project skeleton files |
| `/harness-run` | Autonomous development loop (TDD, verify, commit) |
| `/harness-next` | Plan next version based on completed work |
| `/harness-config` | View/modify runtime settings |

## Key Design Decisions

**Skills, not CLI.** Every step requires multi-turn conversation with context. A CLI can only render templates — the agent fills in the substance.

**TDD is non-negotiable.** Every feature gets tests written first. No exceptions. This is what makes autonomous execution reliable.

**WIP=1.** One feature at a time. Linear progress, no context thrashing, clean git history.

**Cross-session continuity.** `PROGRESS.md` is the state anchor. The agent reads it on startup and knows exactly where to resume. No user briefing needed.

**Structured choices.** When presenting options that shape your product, the agent searches for real examples and explains impact across 5 dimensions — not just a bare list of names.

---

## Install

```bash
npx harness-dev
```

Interactive prompts:
1. Select platform — **Claude Code** or **Codex**
2. Select scope — **Global** (available everywhere) or **Local** (current project only)

Skills are copied to your platform's skill directory. Re-run to update.

### Uninstall

```bash
# Global
rm -rf ~/.claude/skills/harness-init ~/.claude/skills/harness-run ~/.claude/skills/harness-next ~/.claude/skills/harness-config

# Local
rm -rf .claude/skills/harness-init .claude/skills/harness-run .claude/skills/harness-next .claude/skills/harness-config
```

---

## Project Files

When you run `/harness-init`, these files are generated in your project root:

| File | Purpose |
|------|---------|
| `.harness.yaml` | Runtime config (compact threshold, HITL settings) |
| `docs/features.yaml` | Feature definitions with behavior, acceptance criteria, verification |
| `docs/roadmap.yaml` | Stages with goals and exit criteria |
| `PROGRESS.md` | State anchor — where you are, what's done, handoff context |
| `DECISIONS.md` | Technical decisions with rationale |
| `AGENTS.md` | Project entry point (constraints, tech stack, commands) |
| `Makefile` | Standard commands (setup, dev, check) |

---

## Configuration

Modify anytime with `/harness-config`:

| Setting | Default | Description |
|---------|---------|-------------|
| `max_compacts` | 3 | Context compactions before auto-handoff. Higher = longer runs, riskier context |
| `hitl_on_stage_boundary` | true | Pause for your review between stages |

---

## Supported Platforms

| Platform | Global path | Local path |
|----------|------------|------------|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| Codex | `~/.codex/skills/` | `.codex/skills/` |

---

## License

MIT
