import { homedir } from 'node:os';
import { join } from 'node:path';

export function getInstallPath(scope) {
  if (scope === 'global') {
    return join(homedir(), '.codex', 'skills');
  }
  return join(process.cwd(), '.codex', 'skills');
}

export function getUsageHint() {
  return `Skills installed. In Codex, run:
  /harness-init    — Initialize a new project
  /harness-run     — Start autonomous development
  /harness-config  — Modify runtime settings`;
}
