import { readFileSync } from 'fs';
import { join } from 'path';

export type NestedArray<T> = Array<T | NestedArray<T>>;
type Pair = { packet1: NestedArray<number>; packet2: NestedArray<number> };

const packets: NestedArray<number>[] = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line) as NestedArray<number>);

const pairs: Pair[] = packets.reduce<Pair[]>((acc, packet, index) => {
  if ((index + 1) % 2 === 0) {
    acc.push({ packet1: packets[index - 1], packet2: packet });
  }
  return acc;
}, []);

function compare(left: number | NestedArray<number>, right: number | NestedArray<number>): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  } else {
    const leftArray = Array.isArray(left) ? left : [left];
    const rightArray = Array.isArray(right) ? right : [right];
    for (let i = 0; i < Math.min(leftArray.length, rightArray.length); i++) {
      const result = compare(leftArray[i], rightArray[i]);
      if (result !== 0) {
        return result;
      }
    }
    return leftArray.length - rightArray.length;
  }
}

let total = pairs.reduce(
  (acc, { packet1, packet2 }, index) => (acc += compare(packet1, packet2) <= 0 ? index + 1 : 0),
  0,
);
console.log(`The sum of the indices of pairs in the correct order is ${total}.`);

const divider1 = [[2]];
const divider2 = [[6]];
packets.push(divider1, divider2);
packets.sort(compare);

const decoderKey = (packets.indexOf(divider1) + 1) * (packets.indexOf(divider2) + 1);
console.log(`The decoder key for the distress signal is ${decoderKey}.`);
