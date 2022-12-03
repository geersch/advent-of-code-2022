import { readFileSync } from 'fs';
import { join } from 'path';

const data = readFileSync(join(__dirname, 'input.txt'), {
  encoding: 'utf8',
  flag: 'r',
});

const items: string[] = data.split(/\n/);

let total = 0;
const totals: number[] = [];
items.forEach((item: string) => {
  const value = parseInt(item, 10);
  if (isNaN(value)) {
    totals.push(total);
    total = 0;
  } else {
    total += value;
  }
});

totals.sort((a, b) => b - a);

function getTopX(count: number): number {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += totals[i];
  }
  return total;
}

console.log(`The most calories caried by an elf: ${getTopX(1)}.`);
console.log(`The top three Elves are carying ${getTopX(3)} calories.`);
