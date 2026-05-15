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
