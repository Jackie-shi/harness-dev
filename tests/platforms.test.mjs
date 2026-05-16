import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getInstallPath, getUsageHint } from '../platforms/claude-code.mjs';
import { getInstallPath as codexPath, getUsageHint as codexHint } from '../platforms/codex.mjs';
import { homedir } from 'node:os';
import { join } from 'node:path';

describe('claude-code adapter', () => {
  it('returns global path', () => {
    const result = getInstallPath('global');
    assert.equal(result, join(homedir(), '.claude', 'skills'));
  });

  it('returns local path', () => {
    const result = getInstallPath('local');
    assert.equal(result, join(process.cwd(), '.claude', 'skills'));
  });

  it('returns usage hint', () => {
    const hint = getUsageHint();
    assert.ok(hint.includes('/harness-init'));
  });
});

describe('codex adapter', () => {
  it('returns global path', () => {
    const result = codexPath('global');
    assert.equal(result, join(homedir(), '.codex', 'skills'));
  });

  it('returns local path', () => {
    const result = codexPath('local');
    assert.equal(result, join(process.cwd(), '.codex', 'skills'));
  });

  it('returns usage hint', () => {
    const hint = codexHint();
    assert.ok(hint.includes('/harness-init'));
  });
});
