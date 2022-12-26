import { readFileSync } from 'fs';
import { join } from 'path';

const DIGITS: Record<string, number> = {
  '=': -2,
  '-': -1,
  0: 0,
  1: 1,
  2: 2,
};

const fuelRequirement = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .reduce((acc, curr) => (acc += fromSnafu(curr)), 0);

function fromSnafu(snafu: string): number {
  let decimalValue = 0;
  let exponent = snafu.length - 1;
  for (const character of snafu) {
    const value = Math.pow(5, exponent) * DIGITS[character];
    decimalValue += value;
    exponent -= 1;
  }
  return decimalValue;
}

function toSnafu(value: number): string {
  // Decimal to base5.
  let remainder = value % 5;
  let quotient = Math.floor(value / 5);
  let base5: number[] = [remainder];
  while (quotient > 0) {
    remainder = quotient % 5;
    quotient = Math.floor(quotient / 5);
    base5.push(remainder);
  }
  base5.reverse();

  // Convert all numbers > 2.
  let index = base5.findIndex((x) => x > 2);
  while (index !== -1) {
    base5[index] = base5[index] - 5;
    if (index > 0) {
      base5[index - 1] += 1;
    }
    index = base5.findIndex((x) => x > 2);
  }

  // Convert into SNAFU.
  return base5.reduce((acc, curr) => {
    if (curr === 0 || curr === 1 || curr === 2) {
      acc += curr;
    } else if (curr === -1) {
      acc += '-';
    } else if (curr === -2) {
      acc += '=';
    }
    return acc;
  }, '');
}

console.log(`Enter the SNAFU number ${toSnafu(fuelRequirement)} into Bob's console.`);
