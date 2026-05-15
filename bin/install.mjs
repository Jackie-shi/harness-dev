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
