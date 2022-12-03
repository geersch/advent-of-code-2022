import { readFileSync } from 'fs';
import { join } from 'path';

enum Choice {
  ROCK,
  PAPER,
  SCISSORS,
}

const isRock = (x: string) => ['A', 'X'].indexOf(x) > -1;
const isPaper = (x: string) => ['B', 'Y'].indexOf(x) > -1;
const isScissors = (x: string) => ['C', 'Z'].indexOf(x) > -1;

function translateChoice(choice: string): Choice {
  if (isRock(choice)) {
    return Choice.ROCK;
  } else if (isPaper(choice)) {
    return Choice.PAPER;
  } else if (isScissors(choice)) {
    return Choice.SCISSORS;
  }

  throw new Error('Invalid choice.');
}

type Strategy = (opponentChoice: Choice, yourChoice: Choice) => Choice;

function NoopStrategy(_opponentChoice: Choice, yourChoice: Choice): Choice {
  return yourChoice;
}

function AlterChoiceStrategy(
  opponentChoice: Choice,
  yourChoice: Choice
): Choice {
  if (yourChoice === Choice.ROCK) {
    switch (opponentChoice) {
      case Choice.ROCK:
        return Choice.SCISSORS;
      case Choice.PAPER:
        return Choice.ROCK;
      default:
        return Choice.PAPER;
    }
  } else if (yourChoice === Choice.SCISSORS) {
    switch (opponentChoice) {
      case Choice.ROCK:
        return Choice.PAPER;
      case Choice.PAPER:
        return Choice.SCISSORS;
      default:
        return Choice.ROCK;
    }
  }

  return opponentChoice;
}

function calculateScore(input: string[], pickMove: Strategy): number {
  let score = 0;
  input.forEach((item: string) => {
    const [a, b] = item.split(' ');
    const opponentChoice = translateChoice(a);
    const yourChoice = pickMove(opponentChoice, translateChoice(b));

    let youWin = false;
    switch (yourChoice) {
      case Choice.ROCK:
        score += 1;
        youWin = opponentChoice === Choice.SCISSORS;
        break;
      case Choice.PAPER:
        score += 2;
        youWin = opponentChoice === Choice.ROCK;
        break;
      case Choice.SCISSORS:
        score += 3;
        youWin = opponentChoice === Choice.PAPER;
        break;
    }
    const isDraw = !youWin && opponentChoice === yourChoice;

    score += youWin ? 6 : isDraw ? 3 : 0;
  });

  return score;
}

const data = readFileSync(join(__dirname, 'input.txt'), {
  encoding: 'utf8',
  flag: 'r',
});

const items: string[] = data.split(/\n/);

console.log(`Score 1st round: ${calculateScore(items, NoopStrategy)}.`);
console.log(`Score 2nd round: ${calculateScore(items, AlterChoiceStrategy)}.`);
