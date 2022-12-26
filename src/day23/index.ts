import { readFileSync } from 'fs';
import { join } from 'path';
import { hrtime } from 'process';
import { getProcessingTime } from '../utils';

const startTime = hrtime();

const elves = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .reduce((acc, line, y) => {
    line.split('').forEach((tile, x) => {
      if (tile === '#') {
        acc.add(`${x},${y}`);
      }
    });
    return acc;
  }, new Set<string>());

const DIRECTIONS = [
  [
    { x: -1, y: -1 },
    { x: +0, y: -1 },
    { x: +1, y: -1 },
  ],
  [
    { x: -1, y: +1 },
    { x: +0, y: +1 },
    { x: +1, y: +1 },
  ],
  [
    { x: -1, y: -1 },
    { x: -1, y: +0 },
    { x: -1, y: +1 },
  ],
  [
    { x: +1, y: -1 },
    { x: +1, y: +0 },
    { x: +1, y: +1 },
  ],
];

function moveTo(elf: string, turn: number): string {
  const [x, y] = elf.split(',').map(Number);
  if (DIRECTIONS.every((direction) => direction.every(({ x: dx, y: dy }) => !elves.has(`${x + dx},${y + dy}`)))) {
    return `${x},${y}`; // stay in the same spot
  }
  const directions = [...DIRECTIONS];
  directions.splice(directions.length - 1, 0, ...directions.splice(0, turn % 4));
  const direction = directions.find((direction) =>
    direction.every(({ x: dx, y: dy }) => !elves.has(`${x + dx},${y + dy}`)),
  );
  return direction ? `${x + direction[1].x},${y + direction[1].y}` : `${x},${y}`;
}

function move(elves: Set<string>, round: number): number {
  const movements = new Map<string, string[]>();
  let moves = 0;
  for (const elf of elves) {
    let next = moveTo(elf, round);
    if (next === elf) {
      continue;
    }
    moves += 1;
    const elves = movements.get(next);
    if (!elves) {
      movements.set(next, [elf]);
    } else {
      elves.push(elf);
    }
  }
  for (const [key, value] of movements) {
    if (value.length === 1) {
      elves.delete(value[0]);
      elves.add(key);
    }
  }
  return moves;
}

let round = 0;
for (round = 0; round < 10; round++) {
  move(elves, round);
}

let minX = Number.MAX_SAFE_INTEGER;
let maxX = Number.MIN_SAFE_INTEGER;
let minY = Number.MAX_SAFE_INTEGER;
let maxY = Number.MIN_SAFE_INTEGER;
elves.forEach((elf) => {
  const [x, y] = elf.split(',').map(Number);
  minX = Math.min(x, minX);
  maxX = Math.max(x, maxX);
  minY = Math.min(y, minY);
  maxY = Math.max(y, maxY);
});

let groundTiles = 0;
for (let row = minY; row <= maxY; row++) {
  for (let col = minX; col <= maxX; col++) {
    if (!elves.has(`${col},${row}`)) {
      groundTiles += 1;
    }
  }
}

console.log(`There are ${groundTiles} empty ground tiles after round 10.`);

let moves = 0;
do {
  moves = move(elves, round);
  round++;
} while (moves !== 0);

console.log(`No elves moved in round ${round}.`);
console.log(getProcessingTime(hrtime(startTime)));
