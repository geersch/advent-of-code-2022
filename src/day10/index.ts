import { readFileSync } from 'fs';
import { join } from 'path';

const program = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .reduce<{ type: string; value?: number }[]>((acc, curr) => {
    const matches = curr.match(/(addx|noop)\s?(-?[0-9]+)?/);
    if (matches) {
      acc.push({ type: matches[1], value: matches[2] ? parseInt(matches[2]) : undefined });
    }
    return acc;
  }, []);

let cycle = 0;
let registerX = 1;
const measurements: number[] = [];
const crt: string[][] = Array.from({ length: 6 }, () => Array.from({ length: 40 }, () => '.'));
let sprite = new Array(0, 1, 2);
let row = 0;
for (const instruction of program) {
  let cycles: number = 0;
  switch (instruction.type) {
    case 'addx':
      cycles = 2;
      break;
    case 'noop':
      cycles = 1;
      break;
    default:
      throw new Error('Invalid instruction.');
  }
  for (let i = 0; i < cycles; i++) {
    const column = cycle % 40;
    crt[row][column] = sprite.includes(column) ? '#' : '.';
    if (column === 39) {
      row++;
    }
    cycle += 1;
    if ((cycle / 20) % 2 === 1) {
      measurements.push(cycle * registerX);
    }
  }
  if (instruction.value) {
    registerX += instruction.value;
    sprite = [registerX - 1, registerX, registerX + 1];
  }
}

console.log(`The sum of the signal strengts is ${measurements.reduce((acc, curr) => acc + curr, 0)}.`);
for (const row of crt) {
  // Use ANSI codes to color the background to make the letters readable.
  console.log(row.reduce((acc, curr) => (acc += curr === '#' ? '\x1b[47m \x1b[0m' : curr), ''));
}
