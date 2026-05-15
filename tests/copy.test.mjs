import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
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
