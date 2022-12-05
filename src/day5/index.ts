import { readFileSync } from 'fs';
import { join } from 'path';

const data = readFileSync(join(__dirname, 'input.txt'), { encoding: 'utf8' });

const [part1, part2] = data.split(/\n\n/);
const [indexes, ...crates] = part1.split(/\n/).reverse();
const stacks: string[][] = [...Array(indexes.match(/[0-9]+/g)!.length)].map((_) => []);

crates.forEach((line) => {
  line
    .match(/\[[A-Z]\]| {3}\s/g)!
    .map((x) => x.trim().replace(/\[|\]/g, ''))
    .forEach((crate, index) => {
      if (crate) {
        stacks[index].push(crate);
      }
    });
});

type Procedure = { quantity: number; from: number; to: number };

const procedure: Procedure[] = part2.split(/\n/).map((line) => {
  const [quantity, from, to] = line.match(/[0-9]+/g)!.map((x) => parseInt(x));
  return { quantity, from, to };
});

function moveCrates(stacks: string[][], procedure: Procedure[], crane: 9000 | 9001): string {
  procedure.forEach(({ quantity, from, to }) => {
    const crates = stacks[from - 1].splice(-1 * quantity);
    stacks[to - 1].push(...(crane === 9000 ? crates.reverse() : crates));
  });
  return stacks.reduce((acc, current) => (acc += current.length ? current[current.length - 1] : ''), '');
}

console.log(`Top crates using CrateMover 9000: ${moveCrates([...stacks.map((x) => [...x])], procedure, 9000)}.`);
console.log(`Top crates using CrateMover 9001: ${moveCrates([...stacks.map((x) => [...x])], procedure, 9001)}.`);
