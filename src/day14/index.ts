import { readFileSync } from 'fs';
import { cloneDeep } from 'lodash';
import { join } from 'path';

type Point = { x: number; y: number; type: 'Rock' | 'Sand' | 'Floor' };

const paths: Point[][] = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .map((line) => {
    return line.split('->').map((point) => {
      const { 0: x, 1: y } = point.trim().split(',').map(Number);
      return { x, y, type: 'Rock' };
    });
  });

const cave: Point[][] = [];
for (let i = 0; i < paths.length; i++) {
  let rock = paths[i];
  let point = rock.shift();
  while (point) {
    const nextPoint = rock.shift();
    if (!nextPoint) {
      break;
    }
    let { x, y } = point;
    if (nextPoint.y - point.y !== 0) {
      for (let row = Math.min(point.y, nextPoint.y); row <= Math.max(point.y, nextPoint.y); row++) {
        if (!cave[row]) {
          cave[row] = [];
        }
        cave[row].push({ x, y: row, type: 'Rock' });
      }
    } else if (nextPoint.x - point.x !== 0) {
      for (let column = Math.min(nextPoint.x, point.x); column <= Math.max(nextPoint.x, point.x); column++) {
        if (!cave[y]) {
          cave[y] = [];
        }
        cave[y].push({ x: column, y, type: 'Rock' });
      }
    }
    point = nextPoint;
  }
}

function spawnSand(cave: Point[][], origin: Point): Point {
  const { x, y } = origin;
  const directlyBelow = cave[y + 1]?.find((e) => e.x === x);
  if (!directlyBelow) {
    return spawnSand(cave, { x, y: y + 1, type: 'Sand' });
  }
  const toTheLeft = cave[y + 1]?.find((e) => e.x === x - 1);
  if (!toTheLeft) {
    return spawnSand(cave, { x: x - 1, y: y + 1, type: 'Sand' });
  }
  const toTheRight = cave[y + 1]?.find((e) => e.x === x + 1);
  if (!toTheRight) {
    return spawnSand(cave, { x: x + 1, y: y + 1, type: 'Sand' });
  }
  if (directlyBelow && directlyBelow.type === 'Floor') {
    return { x: origin.x, y: origin.y, type: 'Floor' };
  }
  return origin;
}

function pourSand(cave: Point[][], fillUp: boolean): number {
  const maxDepth = cave.length;
  const maxWidth = cave.reduce((acc, row) => {
    const maxWidth = row.reduce((acc, curr) => (curr.x > acc ? curr.x : acc), 0);
    return maxWidth > acc ? maxWidth : acc;
  }, 0);
  const clone = cloneDeep(cave);
  clone[maxDepth + 1] = [];
  for (let i = 0; i < maxWidth * 2; i++) {
    clone[maxDepth + 1].push({ x: i, y: maxDepth + 1, type: 'Floor' });
  }
  let stopPouring = false;
  let iteration = 0;
  while (!stopPouring) {
    iteration += 1;
    const { x, y, type } = spawnSand(clone, { x: 500, y: 0, type: 'Sand' });
    stopPouring = (fillUp && x === 500 && y === 0) || (!fillUp && type === 'Floor');
    if (!fillUp && stopPouring) {
      break;
    }
    if (!clone[y]) {
      clone[y] = [];
    }
    clone[y].push({ x, y, type: 'Sand' });
  }
  return iteration;
}

console.log(`${pourSand(cave, false) - 1} sand units come to rest before they start flowing into the abyss.`);
console.log(`${pourSand(cave, true)} units of sand fall until the source becomes blocked.`);
