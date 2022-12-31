import { getProcessingTime } from '../utils';
import { hrtime } from 'process';
import { readFileSync } from 'fs';
import { join } from 'path';

const startTime = hrtime();

const jets = readFileSync(join(__dirname, 'input.txt'), 'utf8').split('');

/**
 * Shape 1   Shape 2   Shape 3   Shape 4   Shape 4
 * --------  --------  --------  --------  --------
 * 00000000  00000000  00000000  00010000  00000000
 * 00000000  00001000  00000100  00010000  00000000
 * 00000000  00011100  00000100  00010000  00011000
 * 00011110  00001000  00011100  00010000  00011000
 */
const rocks = [0x1e, 0x81c08, 0x4041c, 0x10101010, 0x1818];

function drawTower(tower: number[]): void {
  for (let i = tower.length - 1; i >= 0; i--) {
    const line = tower[i].toString(2).padStart(7, '0').replace(/0/g, '.').replace(/1/g, '#');
    console.log(`|${line}|`);
  }
  console.log('+-------+');
}

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

const tower: number[] = [];
let jetIndex = 0;
let rockIndex = 0;
for (let i = 0; i < 2022; i++) {
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
}

console.log(`After 2022 rocks have stopped falling the tower is ${tower.length} units tall.`);
console.log(getProcessingTime(hrtime(startTime)));
