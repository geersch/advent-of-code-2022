import { readFileSync } from 'fs';
import { cloneDeep } from 'lodash';
import { join } from 'path';

type Point = { x: number; y: number; type: 'Air' | 'Rock' | 'Sand' };

const paths = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .map((line) => line.split(' -> ').map((point) => point.split(',').map(Number)));

const width = Math.max(...paths.map((p) => p.map((p) => p[0])).flat());
const height = Math.max(...paths.map((p) => p.map((p) => p[1])).flat());

const rocks: Point[] = [];
for (const path of paths) {
  for (let i = 1; i < path.length; i++) {
    const [x1, y1, x2, y2] = [...path[i - 1], ...path[i]];
    if (x1 === x2) {
      for (let row = Math.min(y1, y2); row <= Math.max(y1, y2); row++) {
        rocks.push({ x: x1, y: row, type: 'Rock' });
      }
    } else if (y1 === y2) {
      for (let col = Math.min(x1, x2); col <= Math.max(x1, x2); col++) {
        rocks.push({ x: col, y: y1, type: 'Rock' });
      }
    }
  }
}

const cave: Point[][] = [];
for (let row = 0; row <= height; row++) {
  cave[row] = [];
  for (let col = 0; col <= width * 2; col++) {
    cave[row].push({ x: col, y: row, type: 'Air' });
  }
}
rocks.forEach(({ x, y }) => (cave[y][x].type = 'Rock'));

function spawnSand(cave: Point[][], x: number, y: number): Point | undefined {
  if (!cave[y + 1]) {
    return undefined;
  }
  if (cave[y + 1][x].type === 'Air') {
    return spawnSand(cave, x, y + 1);
  }
  if (cave[y + 1][x - 1].type === 'Air') {
    return spawnSand(cave, x - 1, y + 1);
  }
  if (cave[y + 1][x + 1].type === 'Air') {
    return spawnSand(cave, x + 1, y + 1);
  }
  return cave[y][x];
}

function pourSand(cave: Point[][], addFloor: boolean): number {
  const clone = cloneDeep(cave);
  if (addFloor) {
    clone.push([]);
    for (let col = 0; col < clone[0].length; col++) {
      clone[clone.length - 1].push({ x: col, y: clone.length - 1, type: 'Air' });
    }
    clone.push([]);
    for (let col = 0; col < clone[0].length; col++) {
      clone[clone.length - 1].push({ x: col, y: clone.length - 1, type: 'Rock' });
    }
  }
  let stopPouring = false;
  let iteration = 0;
  while (!stopPouring) {
    const point: Point | undefined = spawnSand(clone, 500, 0);
    iteration += point ? 1 : 0;
    if (!point || (point.x === 500 && point.y === 0)) {
      break;
    }
    clone[point.y][point.x].type = 'Sand';
  }
  return iteration;
}

console.log(`${pourSand(cave, false)} sand units come to rest before they start flowing into the abyss.`);
console.log(`${pourSand(cave, true)} units of sand fall until the source becomes blocked.`);
