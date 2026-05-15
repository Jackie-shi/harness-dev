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
