import { getProcessingTime } from '../utils';
import { hrtime } from 'process';
import { readFileSync } from 'fs';
import { join } from 'path';

const startTime = hrtime();

const jets = readFileSync(join(__dirname, 'input.txt'), 'utf8').split('');

/**
 * Shape 1   Shape 2   Shape 3   Shape 4   Shape 5
 * --------  --------  --------  --------  --------
 * 00000000  00000000  00000000  00010000  00000000
 * 00000000  00001000  00000100  00010000  00000000
 * 00000000  00011100  00000100  00010000  00011000
 * 00011110  00001000  00011100  00010000  00011000
 */
const rocks = [0x1e, 0x81c08, 0x4041c, 0x10101010, 0x1818];

function toBytesInt32(value: number): number[] {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, value, true);
  const result: number[] = [];
  for (let i = 0; i < view.byteLength; i++) {
    result.push(view.getUint8(i));
  }
  return result;
}

function calcTowerMask(tower: number[], height: number): number {
  if (height >= tower.length) {
    return 0;
  }

  const mask = tower.slice(height, height + 4).reduce((acc, curr, index) => {
    acc += curr << (8 * index);
    return acc;
  }, 0);

  return mask;
}

function getPeak(tower: number[], count: number): number {
  let result = 0;
  for (let i = tower.length - 1; i >= tower.length - count; i--) {
    result += tower[i];
  }
  return result;
}

function solve(numberOfRocks: number): { height: number; pattern?: { rocks: number; height: number } } {
  const seen = new Map<string, { count: number; height: number; rocks: number }>();
  const tower: number[] = [];
  let jetIndex = 0;
  let rockIndex = 0;
  for (let i = 0; i < numberOfRocks; i++) {
    let height = tower.length + 3;
    let rock = rocks[rockIndex];
    rockIndex += 1;
    if (rockIndex % rocks.length === 0) {
      rockIndex = 0;
    }

    let atRest = false;
    while (!atRest) {
      const jet = jets[jetIndex];
      jetIndex += 1;
      if (jetIndex % jets.length === 0) {
        jetIndex = 0;
      }

      let newPosition = rock;
      if (jet === '<' && (newPosition & 0x40404040) === 0) {
        newPosition = newPosition << 1;
      } else if (jet === '>' && (newPosition & 0x01010101) === 0) {
        newPosition = newPosition >> 1;
      }
      if ((newPosition & calcTowerMask(tower, height)) === 0) {
        rock = newPosition;
      }

      atRest = height <= tower.length && (height === 0 || (rock & calcTowerMask(tower, height - 1)) !== 0);
      if (atRest) {
        const bytes = toBytesInt32(rock).filter((b) => b !== 0);
        for (let i = 0; i < bytes.length; i++) {
          const byte = bytes[i];
          if (height < tower.length) {
            tower[height] |= byte;
          } else {
            tower.push(byte);
          }
          height += 1;
        }
      } else {
        height -= 1;
      }
    }

    if (tower.length >= 100) {
      let shape: number = getPeak(tower, 100);
      const key = `${rockIndex}_${jetIndex}_${shape}`;
      const value = seen.get(key);
      if (!value) {
        seen.set(key, { count: 1, height: tower.length, rocks: i });
      } else {
        value.count += 1;
        value.height = tower.length - value.height;
        value.rocks = i - value.rocks;
      }
    }
  }

  if (seen.size > 0) {
    const parts = [...seen.values()].sort((a, b) => b.count - a.count)[0];
    return { height: tower.length, pattern: { rocks: parts.rocks, height: parts.height } };
  } else {
    return { height: tower.length };
  }
}

const { height: height1 } = solve(2022);
console.log(`After 2022 rocks have stopped falling the tower is ${height1} units tall.`);

const { pattern } = solve(10000);
if (!pattern) {
  throw new Error('No pattern detected, more iterations required.');
}

const remainder = solve(1000000000000 % pattern.rocks).height;
const height2 = Math.floor(1000000000000 / pattern.rocks) * pattern.height + remainder;

console.log(`After 1000000000000 rocks have stopped falling the tower is ${height2} units tall.`);
console.log(getProcessingTime(hrtime(startTime)));
