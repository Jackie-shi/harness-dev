# harness-dev

Fully managed project development via Claude Code / Codex skills.

## Install

```bash
npx harness-dev
```

Select your platform (Claude Code or Codex) and scope (global or local).

## Usage

After installation, use these skills in your AI coding environment:

- `/harness-init` — Initialize a project (one-time setup)
- `/harness-run` — Start autonomous development loop
- `/harness-config` — Modify runtime settings

## How It Works

1. **Init** — Deep conversation to understand your project, then generates skeleton files (features.yaml, roadmap.yaml, PROGRESS.md, etc.)
2. **Run** — Agent self-drives: picks features, implements with TDD, verifies, commits, advances through stages
3. **Config** — Adjust settings like compact threshold and HITL behavior

## License

MIT
