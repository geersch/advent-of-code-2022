import { getProcessingTime } from '../utils';
import { hrtime } from 'process';
import { readFileSync } from 'fs';
import { join } from 'path';

const startTime = hrtime();

const numbers = readFileSync(join(__dirname, 'input.txt'), 'utf8').split(/\n/).map(Number);

function mod(n: number, d: number): number {
  return ((n % d) + d) % d;
}

// This indexception gave me a headache.
function decrypt(
  numbers: number[],
  options: { decryptionKey: number; mixCount: number } = { decryptionKey: 1, mixCount: 1 },
): number {
  let input = numbers.map((n) => n * options.decryptionKey);
  const indexes = Array.from({ length: input.length }, (_, index) => index);
  for (let i = 0; i < options.mixCount; i++) {
    for (const [index, number] of input.entries()) {
      const currentIndex = indexes.indexOf(index);
      let newIndex = mod(currentIndex + number, input.length - 1);
      indexes.splice(newIndex, 0, ...indexes.splice(currentIndex, 1));
    }
  }
  const decrypted = indexes.map((index) => input[index]);
  const indexOfZero = decrypted.indexOf(0);
  return (
    decrypted[mod(indexOfZero + 1000, input.length)] +
    decrypted[mod(indexOfZero + 2000, input.length)] +
    decrypted[mod(indexOfZero + 3000, input.length)]
  );
}

console.log(`The sum of the groove coordinates is ${decrypt(numbers)}.`);
console.log(`The sum of the groove coordinates is ${decrypt(numbers, { decryptionKey: 811589153, mixCount: 10 })}.`);

console.log(getProcessingTime(hrtime(startTime)));
