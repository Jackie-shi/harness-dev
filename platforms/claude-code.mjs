import { homedir } from 'node:os';
import { join } from 'node:path';

export function getInstallPath(scope) {
  if (scope === 'global') {
    return join(homedir(), '.claude', 'skills');
  }
  return join(process.cwd(), '.claude', 'skills');
}

export function getUsageHint() {
  return `Skills installed. In Claude Code, run:
  /harness-init    — Initialize a new project
  /harness-run     — Start autonomous development
  /harness-config  — Modify runtime settings`;
}
