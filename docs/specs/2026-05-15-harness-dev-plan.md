# Harness Dev Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an npm package (`harness-dev`) that installs 3 skills (harness-init, harness-run, harness-config) to Claude Code or Codex via `npx harness-dev`.

**Architecture:** Interactive Node.js ESM installer with platform adapters. Skills are markdown files (SKILL.md) copied to platform-specific directories. Templates provide skeleton files for harness-init to reference.

**Tech Stack:** Node.js 20+, ESM modules, readline for interactive prompts, fs/path for file operations, no external dependencies.

---

## File Structure

```
harness-dev/
├── package.json                 # npm package config with bin entry
├── bin/
│   └── install.mjs             # npx entry point — interactive installer
├── lib/
│   ├── prompts.mjs             # Interactive prompt utilities (readline wrapper)
│   └── copy.mjs                # Recursive copy with overwrite logic
├── platforms/
│   ├── claude-code.mjs         # CC platform adapter
│   └── codex.mjs               # Codex platform adapter
├── skills/
│   ├── harness-init/
│   │   └── SKILL.md            # Init skill content
│   ├── harness-run/
│   │   └── SKILL.md            # Run skill content
│   └── harness-config/
│       └── SKILL.md            # Config skill content
├── templates/
│   ├── AGENTS.md.tmpl          # AGENTS.md skeleton
│   ├── DECISIONS.md.tmpl       # DECISIONS.md skeleton
│   ├── PROGRESS.md.tmpl        # PROGRESS.md skeleton
│   ├── Makefile.tmpl           # Makefile skeleton
│   └── harness.yaml.tmpl       # .harness.yaml default config
├── tests/
│   ├── install.test.mjs        # Installer integration tests
│   ├── platforms.test.mjs      # Platform adapter tests
│   └── copy.test.mjs           # Copy utility tests
└── README.md
```

---

### Task 1: Project Scaffolding & package.json

**Files:**
- Create: `package.json`
- Create: `bin/install.mjs`
- Create: `.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "harness-dev",
  "version": "0.1.0",
  "description": "Fully managed project development via Claude Code / Codex skills",
  "type": "module",
  "bin": {
    "harness-dev": "./bin/install.mjs"
  },
  "files": [
    "bin/",
    "lib/",
    "platforms/",
    "skills/",
    "templates/"
  ],
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "test": "node --test tests/"
  },
  "keywords": ["claude-code", "codex", "skills", "harness", "ai-development"],
  "license": "MIT"
}
```

- [ ] **Step 2: Create bin/install.mjs stub**

```javascript
#!/usr/bin/env node

console.log('harness-dev installer — coming soon');
process.exit(0);
```

- [ ] **Step 3: Create .gitignore**

```
node_modules/
.DS_Store
```

- [ ] **Step 4: Make bin/install.mjs executable and verify**

Run: `chmod +x bin/install.mjs && node bin/install.mjs`
Expected: prints "harness-dev installer — coming soon"

- [ ] **Step 5: Commit**

```bash
git add package.json bin/install.mjs .gitignore
git commit -m "chore: project scaffolding with package.json and bin entry"
```

---

### Task 2: Prompt Utilities

**Files:**
- Create: `lib/prompts.mjs`
- Create: `tests/prompts.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatChoices, parseChoice } from '../lib/prompts.mjs';

describe('formatChoices', () => {
  it('formats options with numbers', () => {
    const result = formatChoices(['Claude Code', 'Codex']);
    assert.equal(result, '  1) Claude Code\n  2) Codex');
  });
});

describe('parseChoice', () => {
  it('returns index for valid numeric input', () => {
    assert.equal(parseChoice('1', 2), 0);
    assert.equal(parseChoice('2', 2), 1);
  });

  it('returns -1 for out of range', () => {
    assert.equal(parseChoice('3', 2), -1);
    assert.equal(parseChoice('0', 2), -1);
  });

  it('returns -1 for non-numeric', () => {
    assert.equal(parseChoice('abc', 2), -1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/prompts.test.mjs`
Expected: FAIL — module not found

- [ ] **Step 3: Implement lib/prompts.mjs**

```javascript
import { createInterface } from 'node:readline';

export function formatChoices(options) {
  return options.map((opt, i) => `  ${i + 1}) ${opt}`).join('\n');
}

export function parseChoice(input, max) {
  const n = parseInt(input, 10);
  if (isNaN(n) || n < 1 || n > max) return -1;
  return n - 1;
}

export async function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function choose(question, options) {
  const formatted = formatChoices(options);
  let choice = -1;
  while (choice === -1) {
    const display = `${question}\n${formatted}\n> `;
    const answer = await ask(display);
    choice = parseChoice(answer, options.length);
  }
  return choice;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/prompts.test.mjs`
Expected: PASS (2 suites, all assertions pass)

- [ ] **Step 5: Commit**

```bash
git add lib/prompts.mjs tests/prompts.test.mjs
git commit -m "feat: add interactive prompt utilities"
```

---

### Task 3: Copy Utility

**Files:**
- Create: `lib/copy.mjs`
- Create: `tests/copy.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { copyDir } from '../lib/copy.mjs';

describe('copyDir', () => {
  let src, dest;

  beforeEach(() => {
    src = mkdtempSync(join(tmpdir(), 'harness-src-'));
    dest = mkdtempSync(join(tmpdir(), 'harness-dest-'));
  });

  afterEach(() => {
    rmSync(src, { recursive: true, force: true });
    rmSync(dest, { recursive: true, force: true });
  });

  it('copies files recursively', () => {
    mkdirSync(join(src, 'sub'));
    writeFileSync(join(src, 'a.md'), 'hello');
    writeFileSync(join(src, 'sub', 'b.md'), 'world');

    copyDir(src, dest);

    assert.equal(readFileSync(join(dest, 'a.md'), 'utf8'), 'hello');
    assert.equal(readFileSync(join(dest, 'sub', 'b.md'), 'utf8'), 'world');
  });

  it('overwrites existing files (idempotent)', () => {
    writeFileSync(join(src, 'a.md'), 'new');
    writeFileSync(join(dest, 'a.md'), 'old');

    copyDir(src, dest);

    assert.equal(readFileSync(join(dest, 'a.md'), 'utf8'), 'new');
  });

  it('creates destination if it does not exist', () => {
    const newDest = join(dest, 'nested', 'path');
    writeFileSync(join(src, 'a.md'), 'content');

    copyDir(src, newDest);

    assert.equal(readFileSync(join(newDest, 'a.md'), 'utf8'), 'content');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/copy.test.mjs`
Expected: FAIL — module not found

- [ ] **Step 3: Implement lib/copy.mjs**

```javascript
import { readdirSync, statSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

export function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/copy.test.mjs`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/copy.mjs tests/copy.test.mjs
git commit -m "feat: add recursive copy utility with overwrite support"
```

---

### Task 4: Platform Adapters

**Files:**
- Create: `platforms/claude-code.mjs`
- Create: `platforms/codex.mjs`
- Create: `tests/platforms.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getInstallPath, getUsageHint } from '../platforms/claude-code.mjs';
import { getInstallPath as codexPath, getUsageHint as codexHint } from '../platforms/codex.mjs';
import { homedir } from 'node:os';
import { join } from 'node:path';

describe('claude-code adapter', () => {
  it('returns global path', () => {
    const result = getInstallPath('global');
    assert.equal(result, join(homedir(), '.claude', 'skills', 'harness'));
  });

  it('returns local path', () => {
    const result = getInstallPath('local');
    assert.equal(result, join(process.cwd(), '.claude', 'skills', 'harness'));
  });

  it('returns usage hint', () => {
    const hint = getUsageHint();
    assert.ok(hint.includes('/harness-init'));
  });
});

describe('codex adapter', () => {
  it('returns global path', () => {
    const result = codexPath('global');
    assert.equal(result, join(homedir(), '.codex', 'skills', 'harness'));
  });

  it('returns local path', () => {
    const result = codexPath('local');
    assert.equal(result, join(process.cwd(), '.codex', 'skills', 'harness'));
  });

  it('returns usage hint', () => {
    const hint = codexHint();
    assert.ok(hint.includes('/harness-init'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/platforms.test.mjs`
Expected: FAIL — modules not found

- [ ] **Step 3: Implement platforms/claude-code.mjs**

```javascript
import { homedir } from 'node:os';
import { join } from 'node:path';

export function getInstallPath(scope) {
  if (scope === 'global') {
    return join(homedir(), '.claude', 'skills', 'harness');
  }
  return join(process.cwd(), '.claude', 'skills', 'harness');
}

export function getUsageHint() {
  return `Skills installed. In Claude Code, run:
  /harness-init    — Initialize a new project
  /harness-run     — Start autonomous development
  /harness-config  — Modify runtime settings`;
}
```

- [ ] **Step 4: Implement platforms/codex.mjs**

```javascript
import { homedir } from 'node:os';
import { join } from 'node:path';

export function getInstallPath(scope) {
  if (scope === 'global') {
    return join(homedir(), '.codex', 'skills', 'harness');
  }
  return join(process.cwd(), '.codex', 'skills', 'harness');
}

export function getUsageHint() {
  return `Skills installed. In Codex, run:
  /harness-init    — Initialize a new project
  /harness-run     — Start autonomous development
  /harness-config  — Modify runtime settings`;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/platforms.test.mjs`
Expected: PASS (6 tests)

- [ ] **Step 6: Commit**

```bash
git add platforms/claude-code.mjs platforms/codex.mjs tests/platforms.test.mjs
git commit -m "feat: add platform adapters for Claude Code and Codex"
```

---

### Task 5: Installer Entry Point

**Files:**
- Modify: `bin/install.mjs`
- Create: `tests/install.test.mjs`

- [ ] **Step 1: Write the failing test**

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { installSkills } from '../bin/install.mjs';

describe('installSkills', () => {
  let dest;

  beforeEach(() => {
    dest = mkdtempSync(join(tmpdir(), 'harness-install-'));
  });

  afterEach(() => {
    rmSync(dest, { recursive: true, force: true });
  });

  it('copies all skill directories to destination', () => {
    installSkills(dest);

    assert.ok(existsSync(join(dest, 'harness-init', 'SKILL.md')));
    assert.ok(existsSync(join(dest, 'harness-run', 'SKILL.md')));
    assert.ok(existsSync(join(dest, 'harness-config', 'SKILL.md')));
  });

  it('is idempotent — second install overwrites cleanly', () => {
    installSkills(dest);
    installSkills(dest);

    assert.ok(existsSync(join(dest, 'harness-init', 'SKILL.md')));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/install.test.mjs`
Expected: FAIL — installSkills not exported

- [ ] **Step 3: Implement bin/install.mjs**

```javascript
#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { copyDir } from '../lib/copy.mjs';
import { choose } from '../lib/prompts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

export function installSkills(destDir) {
  const skillsDir = join(ROOT, 'skills');
  copyDir(skillsDir, destDir);
}

async function main() {
  console.log(`\n  harness-dev v${pkg.version}`);
  console.log('  Fully managed project development\n');

  const platformIdx = await choose('Select platform:', ['Claude Code', 'Codex']);
  const scopeIdx = await choose('Install scope:', ['Global', 'Local (current directory)']);

  const platformModule = platformIdx === 0
    ? await import('../platforms/claude-code.mjs')
    : await import('../platforms/codex.mjs');

  const scope = scopeIdx === 0 ? 'global' : 'local';
  const destDir = platformModule.getInstallPath(scope);

  installSkills(destDir);

  console.log(`\n  Installed to: ${destDir}`);
  console.log(`\n${platformModule.getUsageHint()}\n`);
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url).includes(process.argv[1]);
if (isDirectRun) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/install.test.mjs`
Expected: PASS (2 tests)

- [ ] **Step 5: Run full test suite**

Run: `node --test tests/`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add bin/install.mjs tests/install.test.mjs
git commit -m "feat: implement interactive installer with platform selection"
```

---

### Task 6: Skill — harness-init

**Files:**
- Create: `skills/harness-init/SKILL.md`

- [ ] **Step 1: Write the SKILL.md**

```markdown
---
name: harness-init
description: Initialize a project with Harness — deep conversation to understand what you're building, then generate skeleton files (features.yaml, roadmap.yaml, PROGRESS.md, etc.) for fully managed development.
---
```

PLACEHOLDER_SKILL_INIT_BODY

- [ ] **Step 2: Verify frontmatter is valid**

Run: `head -4 skills/harness-init/SKILL.md`
Expected: Shows `---`, `name: harness-init`, `description: ...`, `---`

- [ ] **Step 3: Commit**

```bash
git add skills/harness-init/SKILL.md
git commit -m "feat: add harness-init skill"
```

---

### Task 7: Skill — harness-run

**Files:**
- Create: `skills/harness-run/SKILL.md`

- [ ] **Step 1: Write the SKILL.md**

```markdown
---
name: harness-run
description: Start autonomous development loop — picks features, implements with TDD, verifies, commits, and advances through stages until completion or exit condition.
---
```

PLACEHOLDER_SKILL_RUN_BODY

- [ ] **Step 2: Verify frontmatter is valid**

Run: `head -4 skills/harness-run/SKILL.md`
Expected: Shows `---`, `name: harness-run`, `description: ...`, `---`

- [ ] **Step 3: Commit**

```bash
git add skills/harness-run/SKILL.md
git commit -m "feat: add harness-run skill"
```

---

### Task 8: Skill — harness-config

**Files:**
- Create: `skills/harness-config/SKILL.md`

- [ ] **Step 1: Write the SKILL.md**

```markdown
---
name: harness-config
description: View and modify Harness runtime configuration (.harness.yaml) — compact threshold, HITL settings, and other project-level options.
---
```

PLACEHOLDER_SKILL_CONFIG_BODY

- [ ] **Step 2: Verify frontmatter is valid**

Run: `head -4 skills/harness-config/SKILL.md`
Expected: Shows `---`, `name: harness-config`, `description: ...`, `---`

- [ ] **Step 3: Commit**

```bash
git add skills/harness-config/SKILL.md
git commit -m "feat: add harness-config skill"
```

---

### Task 9: Templates

**Files:**
- Create: `templates/AGENTS.md.tmpl`
- Create: `templates/DECISIONS.md.tmpl`
- Create: `templates/PROGRESS.md.tmpl`
- Create: `templates/Makefile.tmpl`
- Create: `templates/harness.yaml.tmpl`

- [ ] **Step 1: Create templates/harness.yaml.tmpl**

```yaml
max_compacts: 3
hitl_on_stage_boundary: true
```

- [ ] **Step 2: Create templates/PROGRESS.md.tmpl**

```markdown
# Progress

## Current
- Stage: — (init complete, not yet started)
- Feature: —
- Last completed: Init @ {{date}}

## History
- [{{date}}] Init complete
```

- [ ] **Step 3: Create templates/DECISIONS.md.tmpl**

```markdown
# Decisions

<!-- Decisions are recorded here during harness-init and harness-run -->
```

- [ ] **Step 4: Create templates/AGENTS.md.tmpl**

```markdown
# {{project_name}}

{{project_description}}

## Project Type
{{project_type}}

## Tech Stack
{{tech_stack}}

## Quick Start
```
make setup    # Install dependencies
make dev      # Start development server
make check    # Run linter + tests
```

## Constraints
- TDD: Write tests before implementation
- WIP=1: One feature at a time
- Atomic commits per logical unit

## Initialization Flow
Every session start: read PROGRESS.md for current state.
Every session end: update PROGRESS.md and commit.
```

- [ ] **Step 5: Create templates/Makefile.tmpl**

```makefile
.PHONY: setup dev check

setup:
	@echo "Run project setup here"

dev:
	@echo "Run dev server here"

check:
	@echo "Run linter + tests here"
```

- [ ] **Step 6: Commit**

```bash
git add templates/
git commit -m "feat: add skeleton file templates"
```

---

### Task 10: README & Final Verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README.md**

```markdown
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
```

- [ ] **Step 2: Run full test suite**

Run: `node --test tests/`
Expected: All tests pass

- [ ] **Step 3: Test npx simulation**

Run: `node bin/install.mjs`
Expected: Shows welcome message, prompts for platform and scope (Ctrl+C to exit)

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add README with install and usage instructions"
```

---

## Plan Notes

**Tasks 6-8 (Skills) contain placeholder bodies.** The SKILL.md body content is the core intellectual property of this project — it's the prompt engineering that makes the Agent behave correctly. Each skill body will be substantial (200-500 lines of carefully crafted instructions). The placeholders mark where this content goes; writing the full skill prompts is a separate focused effort after the infrastructure is in place.

**Execution order:** Tasks 1-5 build the installer infrastructure. Tasks 6-9 add content. Task 10 wraps up. Tasks 1-5 are sequential (each builds on the prior). Tasks 6-8 are independent of each other. Task 9 is independent of 6-8.
