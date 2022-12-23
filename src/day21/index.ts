import { getProcessingTime } from '../utils';
import { hrtime } from 'process';
import { readFileSync } from 'fs';
import { join } from 'path';

const startTime = hrtime();

const loneNumberRe = /(?<monkey>[a-z]+): (?<number>\d+)/;
const jobRe = /(?<monkey>[a-z]+): (?<operand1>[a-z]+) (?<operator>|\+|-|\/|\*) (?<operand2>[a-z]+)/;

type Expression = { operand1: string; operator: string; operand2: string };
type Context = Record<string, number>;
type Expressions = Record<string, Expression>;

function evalExpr(expression: Expression, context: Context): number {
  const operand1 = context[expression.operand1];
  const operand2 = context[expression.operand2];
  switch (expression.operator) {
    case '+':
      return operand1 + operand2;
    case '-':
      return operand1 - operand2;
    case '/':
      return operand1 / operand2;
    case '*':
      return operand1 * operand2;
  }
  throw new Error('Invalid operation.');
}

const context: Context = {};
const expressions: Expressions = {};

readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .forEach((line) => {
    if (loneNumberRe.test(line)) {
      const { monkey, number } = line.match(loneNumberRe)!.groups!;
      context[monkey] = parseInt(number);
    } else if (jobRe.test(line)) {
      const { monkey, operand1, operator, operand2 } = line.match(jobRe)!.groups!;
      expressions[monkey] = { operand1, operator, operand2 };
    }
  });

function solveForRoot(expressions: Expressions, context: Context): Context {
  const evaluatedContext: Context = { ...context };
  const keys = Object.keys(expressions);
  while (!evaluatedContext['root']) {
    keys.forEach((key) => {
      const expression = expressions[key];
      if (evaluatedContext[expression.operand1] && evaluatedContext[expression.operand2]) {
        evaluatedContext[key] = evalExpr(expressions[key], evaluatedContext);
      }
    });
  }
  return evaluatedContext;
}

console.log(`The monkey named root will yell the number ${solveForRoot(expressions, context)['root']}.`);

type Path = {
  name: string;
  visited: string[];
};

const root = expressions['root'];
const paths: Path[] = [
  { name: root.operand1, visited: [] },
  { name: root.operand2, visited: [] },
];

let pathToHuman: Path | undefined;
for (let i = 0; i < paths.length; i++) {
  const current = paths[i];
  if (current.name === 'humn') {
    current.visited.push('humn');
    pathToHuman = current;
  } else {
    if (context[current.name] === undefined) {
      paths.push({
        name: expressions[current.name].operand1,
        visited: [...current.visited, current.name],
      });
      paths.push({
        name: expressions[current.name].operand2,
        visited: [...current.visited, current.name],
      });
    }
  }
}

if (!pathToHuman) {
  throw new Error('Could not find a path to the human.');
}

const evaluatedContext = solveForRoot(expressions, context);

if (pathToHuman.visited[0] === root.operand1) {
  evaluatedContext[root.operand1] = evaluatedContext[root.operand2];
} else {
  evaluatedContext[root.operand2] = evaluatedContext[root.operand1];
}
evaluatedContext['root'] = evaluatedContext[root.operand1] * 2;

for (let i = 0; i < pathToHuman.visited.length; i++) {
  const current = pathToHuman.visited[i];
  const next = pathToHuman.visited.length > i + 1 ? pathToHuman.visited[i + 1] : undefined;
  if (!next) {
    break;
  }
  const expression = expressions[current];
  let newExpr: Expression;
  if (expression.operand1 === next) {
    if (expression.operator === '/') {
      newExpr = { operand1: current, operator: '*', operand2: expression.operand2 };
    } else if (expression.operator === '*') {
      newExpr = { operand1: current, operator: '/', operand2: expression.operand2 };
    } else if (expression.operator === '+') {
      newExpr = { operand1: current, operator: '-', operand2: expression.operand2 };
    } else if (expression.operator === '-') {
      newExpr = { operand1: current, operator: '+', operand2: expression.operand2 };
    }
    evaluatedContext[expression.operand1] = evalExpr(newExpr!, evaluatedContext);
  } else if (expression.operand2 === next) {
    if (expression.operator === '/') {
      newExpr = { operand1: expression.operand1, operator: '/', operand2: current };
    } else if (expression.operator === '*') {
      newExpr = { operand1: current, operator: '/', operand2: expression.operand1 };
    } else if (expression.operator === '+') {
      newExpr = { operand1: current, operator: '-', operand2: expression.operand1 };
    } else if (expression.operator === '-') {
      newExpr = { operand1: expression.operand1, operator: '-', operand2: current };
    }
    evaluatedContext[expression.operand2] = evalExpr(newExpr!, evaluatedContext);
  }
}

console.log(`Yell the number ${evaluatedContext['humn']} to pass root's equality test.`);
console.log(getProcessingTime(hrtime(startTime)));
