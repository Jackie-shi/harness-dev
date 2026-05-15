import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
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
