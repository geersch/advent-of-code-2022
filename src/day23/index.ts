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

function moveNorth(elves: Set<string>, x: number, y: number): { x: number; y: number } | undefined {
  const northbound = [
    { x: x - 1, y: y - 1 },
    { x, y: y - 1 },
    { x: x + 1, y: y - 1 },
  ];
  if (!northbound.some(({ x, y }) => elves.has(`${x},${y}`))) {
    return { x, y: y - 1 };
  }
}

function moveSouth(elves: Set<string>, x: number, y: number): { x: number; y: number } | undefined {
  const soundbound = [
    { x: x - 1, y: y + 1 },
    { x: x, y: y + 1 },
    { x: x + 1, y: y + 1 },
  ];
  if (!soundbound.some(({ x, y }) => elves.has(`${x},${y}`))) {
    return { x, y: y + 1 };
  }
}

function moveWest(elves: Set<string>, x: number, y: number): { x: number; y: number } | undefined {
  const westbound = [
    { x: x - 1, y: y - 1 },
    { x: x - 1, y: y },
    { x: x - 1, y: y + 1 },
  ];
  if (!westbound.some(({ x, y }) => elves.has(`${x},${y}`))) {
    return { x: x - 1, y };
  }
}

function moveEast(elves: Set<string>, x: number, y: number): { x: number; y: number } | undefined {
  const eastbound = [
    { x: x + 1, y: y - 1 },
    { x: x + 1, y: y },
    { x: x + 1, y: y + 1 },
  ];
  if (!eastbound.some(({ x, y }) => elves.has(`${x},${y}`))) {
    return { x: x + 1, y };
  }
}

function moveTo(elf: string, turn: number) {
  const [x, y] = elf.split(',').map(Number);

  const adjacentPositions = [
    // Northbound
    { x: x - 1, y: y - 1 },
    { x, y: y - 1 },
    { x: x + 1, y: y - 1 },
    // Eastbound
    { x: x + 1, y },
    // Southbound
    { x: x - 1, y: y + 1 },
    { x: x, y: y + 1 },
    { x: x + 1, y: y + 1 },
    // Westbound
    { x: x - 1, y },
  ];

  const elfNearby = adjacentPositions.some(({ x, y }) => elves.has(`${x},${y}`));
  if (!elfNearby) {
    return `${x},${y}`; // stay in the same spot
  }

  const directions = [moveNorth, moveSouth, moveWest, moveEast];
  const shift = turn % 4;
  if (shift > 0) {
    directions.splice(directions.length - 1, 0, ...directions.splice(0, shift));
  }
  let moveTo: { x: number; y: number } | undefined;

  for (const direction of directions) {
    moveTo = direction(elves, x, y);
    if (moveTo) {
      break;
    }
  }

  if (!moveTo) {
    return `${x},${y}`; // stay in the same spot
  }

  return `${moveTo.x},${moveTo.y}`;
}

function move(elves: Set<string>, round: number): number {
  const movements = new Map<string, string[]>();
  let moves = 0;

  for (const elf of elves) {
    // Where can we move the elf to?
    let next = moveTo(elf, round);
    if (next === elf) {
      continue;
    }

    const elves = movements.get(next);
    if (!elves) {
      movements.set(next, [elf]);
    } else {
      elves.push(elf);
    }

    moves += 1;
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
