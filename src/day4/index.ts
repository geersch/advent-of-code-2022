import { readFileSync } from 'fs';
import { join } from 'path';

const data = readFileSync(join(__dirname, 'input.txt'), {
  encoding: 'utf8',
  flag: 'r',
});

const items: string[] = data.split(/\n/);

type Range = {
  start: number;
  end: number;
};

/**
 * PART 1 + 2
 */

function fullyIntersects(a: Range, b: Range): boolean {
  return (
    (a.start >= b.start &&
      a.start <= b.end &&
      a.end >= b.start &&
      a.end <= b.end) ||
    (b.start >= a.start &&
      b.start <= a.end &&
      b.end >= a.start &&
      b.end <= a.end)
  );
}

function intersects(a: Range, b: Range): boolean {
  const maxMin = Math.max(a.start, b.start);
  const minMax = Math.min(a.end, b.end);
  return maxMin <= minMax;
}

let containedRanges = 0;
let overlappingRanges = 0;
items.forEach((item) => {
  const [first, second] = item.split(',');
  const [min1, max1] = first.split('-');
  const [min2, max2] = second.split('-');
  const firstRange: Range = {
    start: parseInt(min1, 10),
    end: parseInt(max1, 10),
  };
  const secondRange: Range = {
    start: parseInt(min2, 10),
    end: parseInt(max2, 10),
  };

  if (intersects(firstRange, secondRange)) {
    overlappingRanges += 1;

    if (fullyIntersects(firstRange, secondRange)) {
      containedRanges += 1;
    }
  }
});

console.log(`There are ${containedRanges} ranges that fully contain another.`);
console.log(`There are ${overlappingRanges} overlapping ranges.`);
