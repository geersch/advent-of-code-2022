import { readFileSync } from 'fs';
import { join } from 'path';
import { cloneDeep } from 'lodash';

function performOperation(operation: string, old: number): number {
  const parts = operation.split(' ');
  let a = parts[0] === 'old' ? old : Number(parts[0]);
  let b = parts[2] === 'old' ? old : Number(parts[2]);
  switch (parts[1]) {
    case '*':
      return a * b;
    case '+':
      return a + b;
    default:
      throw new Error('Invalid operation.');
  }
}

interface Monkey {
  items: number[];
  operation: string;
  divisor: number;
  truthyMonkey: number;
  falseyMonkey: number;
}

const monkeys = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n\n/)
  .reduce<Monkey[]>((acc, curr) => {
    const data = curr.split(/\n/);
    acc.push({
      items: data[1]
        .replace(/[^0-9,]/g, '')
        .split(',')
        .map(Number),
      operation: data[2].replace('Operation: new =', '').trim(),
      divisor: +data[3].replace(/[^0-9]/g, ''),
      truthyMonkey: +data[4].replace(/[^0-9]/g, ''),
      falseyMonkey: +data[5].replace(/[^0-9]/g, ''),
    });
    return acc;
  }, []);

function calcMonkeyBusiness(monkeys: Monkey[], rounds: number, relaxLevel?: number): number {
  const inspections = Array.from({ length: monkeys.length }, () => 0);
  const allDivisors = monkeys.reduce((acc, curr) => (acc *= curr.divisor), 1);
  for (let round = 1; round <= rounds; round++) {
    for (const [index, monkey] of monkeys.entries()) {
      let item = monkey.items.shift();
      while (item) {
        inspections[index] += 1;
        item %= allDivisors;
        let worryLevel = performOperation(monkey.operation, item);
        if (relaxLevel) {
          worryLevel = Math.floor(worryLevel / relaxLevel);
        }
        const divisable = worryLevel % monkey.divisor === 0;
        const targetMonkey = divisable ? monkeys[monkey.truthyMonkey] : monkeys[monkey.falseyMonkey];
        targetMonkey.items.push(worryLevel);
        item = monkey.items.shift();
      }
    }
  }
  return inspections
    .reduce<number[]>((acc, curr) => {
      acc.push(curr);
      return acc;
    }, [])
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((acc, curr) => acc * curr);
}

console.log(`The level of monkey business after 20 rounds is ${calcMonkeyBusiness(cloneDeep(monkeys), 20, 3)}.`);
console.log(`The level of monkey business after 10000 rounds is ${calcMonkeyBusiness(cloneDeep(monkeys), 10000)}.`);
