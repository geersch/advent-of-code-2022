import { readFileSync } from 'fs';
import { join } from 'path';

function getPriority(itemType: string): number {
  const charCode = itemType.charCodeAt(0);
  if (charCode >= 97 && charCode <= 122) {
    return charCode - 96;
  } else {
    return charCode - 38;
  }
}

const data = readFileSync(join(__dirname, 'input.txt'), {
  encoding: 'utf8',
  flag: 'r',
});

const items: string[] = data.split(/\n/);

/**
 * PART 1
 */
let total1 = 0;
items.forEach((item: string) => {
  const index = item.length / 2;
  const firstSet = new Set(item.slice(0, index));
  const secondSet = new Set(item.slice(index));
  [...firstSet]
    .filter((item) => secondSet.has(item))
    .forEach((itemType) => (total1 += getPriority(itemType)));
});

console.log(`The sum of the priorities is ${total1}.`);

/**
 * PART 2
 */
let total2 = 0;
let backpacks: string[] = [];
items.forEach((item: string) => {
  backpacks.push(item);
  if (backpacks.length === 3) {
    const [first, second, third] = backpacks;
    const [badge] = [...new Set(first)].filter(
      (item) => second.indexOf(item) > -1 && third.indexOf(item) > -1
    );
    total2 += getPriority(badge);
    backpacks = [];
  }
});

console.log(`The sum of the priorities is ${total2}.`);
