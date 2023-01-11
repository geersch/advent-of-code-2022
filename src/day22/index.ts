import { getProcessingTime } from '../utils';
import { hrtime } from 'process';
import { readFileSync } from 'fs';
import { join } from 'path';

const startTime = hrtime();

let grid: string[] = [];
let moves: string = '';
let maxLength = 0;

// https://youtu.be/kktpopXsX2E (by hyper-neutrino)
const data = readFileSync(join(__dirname, 'input.txt'), 'utf8').split(/\n/);
data.forEach((line, index) => {
  if (index < data.length - 2) {
    grid.push(line);
    maxLength = Math.max(maxLength, line.length);
  } else {
    moves = line;
  }
});

// Turn the board into a rectangle.
grid = grid.map((line) => line.padEnd(maxLength, ' '));

let row = 0;
let col = 0;
while (grid[row][col] !== '.') {
  col += 1;
}

let dr = 0;
let dc = 1; // initially moving to the right (move the column, but not the row)

function mod(n: number, d: number): number {
  return ((n % d) + d) % d;
}

const matches = moves.matchAll(/(?<count>\d+)(?<dir>[RL]?)/g);
for (const match of matches) {
  const { count, dir } = match.groups!;
  const tiles = parseInt(count);

  for (let i = 0; i < tiles; i++) {
    let nextRow = row;
    let nextCol = col;
    while (true) {
      nextRow = mod(nextRow + dr, grid.length);
      nextCol = mod(nextCol + dc, maxLength);
      // Keep walking to make sure we are on the board.
      if (grid[nextRow][nextCol] !== ' ') {
        break;
      }
    }
    // Stop if we hit a wall.
    if (grid[nextRow][nextCol] === '#') {
      break;
    }
    row = nextRow;
    col = nextCol;
  }

  // Swap the column and row and invert one of them.
  if (dir === 'R') {
    const temp = dr;
    dr = dc;
    dc = -temp;
  } else if (dir === 'L') {
    const temp = dr;
    dr = -dc;
    dc = temp;
  }
}

let facing = 0;
if (dr === 0) {
  // moving left or right
  facing = dc === 1 ? 0 : 2;
} else {
  // moving up or down
  facing = dr === 1 ? 1 : 3;
}

const password = 1000 * (row + 1) + 4 * (col + 1) + facing;
console.log(`The final password is ${password}.`);

console.log(getProcessingTime(hrtime(startTime)));
