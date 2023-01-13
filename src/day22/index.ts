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

function mod(n: number, d: number): number {
  return ((n % d) + d) % d;
}

function solve1(grid: string[], moves: string): number {
  let dr = 0;
  let dc = 1; // initially moving to the right (move the column, but not the row)
  let row = 0;
  let col = 0;
  while (grid[row][col] !== '.') {
    col += 1;
  }

  const matches = moves.matchAll(/(?<count>\d+)(?<dir>[RL]?)/g);
  for (const match of matches) {
    const { count, dir } = match.groups!;
    const tiles = parseInt(count);

    for (let i = 0; i < tiles; i++) {
      let cdr = dr;
      let cdc = dc;
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
        dr = cdr;
        dc = cdc;
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

  return 1000 * (row + 1) + 4 * (col + 1) + facing;
}

/**
 *0/0            50          100      149
 *               ┌───────────┬──────────┐
 *               │     2↑    │     3↑   │
 *               │←1         │        4→│
 *               │           │          │
 *               │           │     5↓   │
 *50             ├───────────┼──────────┘
 *               │           │
 *               │←7       6→│
 *               │           │
 *               │           │
 *100 ┌──────────┼───────────┤
 *    │    10↑   │           │
 *    │←11       │         8→│
 *    │          │           │
 *    │          │     9↓    │
 *150 ├──────────┼───────────┘
 *    │          │
 *    │←12    14→│
 *    │          │
 *    │    13↓   │
 *199 └──────────┘
 */
function solve2(grid: string[], moves: string): number {
  let dr = 0;
  let dc = 1; // initially moving to the right (move the column, but not the row)
  let row = 0;
  let col = 0;
  while (grid[row][col] !== '.') {
    col += 1;
  }

  const matches = moves.matchAll(/(?<count>\d+)(?<dir>[RL]?)/g);
  for (const match of matches) {
    const { count, dir } = match.groups!;
    const tiles = parseInt(count);

    for (let i = 0; i < tiles; i++) {
      let cdr = dr;
      let cdc = dc;
      let nextRow = row + dr;
      let nextCol = col + dc;

      if (nextCol <= 49 && 0 <= nextRow && nextRow < 50 && dc === -1) {
        // 1 goes right at 11
        dc = 1;
        dr = 0;
        nextRow = 149 - nextRow;
        nextCol = 0;
      } else if (nextRow < 0 && 50 <= nextCol && nextCol < 100 && dr === -1) {
        // 2 goes right at 12
        dc = 1;
        dr = 0;
        nextRow = nextCol + 100;
        nextCol = 0;
      } else if (nextRow < 0 && 100 <= nextCol && nextCol < 150 && dr === -1) {
        // 3 goes up at 13
        dr = -1;
        dc = 0;
        nextRow = 199;
        nextCol = nextCol - 100;
      } else if (nextCol >= 150 && 0 <= nextRow && nextRow < 50 && dc === 1) {
        // 4 goes left at 8
        dr = 0;
        dc = -1;
        nextRow = 149 - nextRow;
        nextCol = 99;
      } else if (nextRow >= 50 && 100 <= nextCol && nextCol < 150 && dr === 1) {
        // 5 goes left at 6
        dc = -1;
        dr = 0;
        nextRow = nextCol - 50;
        nextCol = 99;
      } else if (nextCol >= 100 && 50 <= nextRow && nextRow < 100 && dc === 1) {
        // 6 goes up at 5
        dr = -1;
        dc = 0;
        nextCol = nextRow + 50;
        nextRow = 49;
      } else if (nextCol <= 49 && 50 <= nextRow && nextRow < 100 && dc === -1) {
        // 7 goes down at 10
        dc = 0;
        dr = 1;
        nextCol = nextRow - 50;
        nextRow = 100;
      } else if (nextCol >= 100 && 100 <= nextRow && nextRow < 150 && dc === 1) {
        // 8 goes left at 4
        dc = -1;
        dr = 0;
        nextRow = 149 - nextRow;
        nextCol = 149;
      } else if (nextRow >= 150 && 50 <= nextCol && nextCol < 100 && dr === 1) {
        // 9 goes left at 14
        dc = -1;
        dr = 0;
        nextRow = nextCol + 100;
        nextCol = 49;
      } else if (nextRow < 100 && 0 <= nextCol && nextCol < 50 && dr === -1) {
        // 10 goes right at 7
        dc = 1;
        dr = 0;
        nextRow = nextCol + 50;
        nextCol = 50;
      } else if (nextCol < 0 && 100 <= nextRow && nextRow < 150 && dc === -1) {
        // 11 goes right at 1
        dc = 1;
        dr = 0;
        nextRow = 149 - nextRow;
        nextCol = 50;
      } else if (nextCol < 0 && 150 <= nextRow && nextRow < 200 && dc === -1) {
        // 12 goes down at 2
        dc = 0;
        dr = 1;
        nextCol = nextRow - 100;
        nextRow = 0;
      } else if (nextRow >= 200 && 0 <= nextCol && nextCol < 50 && dr === 1) {
        // 13 goes down at 3
        dc = 0;
        dr = 1;
        nextCol = nextCol + 100;
        nextRow = 0;
      } else if (nextCol >= 50 && 150 <= nextRow && nextRow < 200 && dc === 1) {
        // 14 goes up at 9
        dc = 0;
        dr = -1;
        nextCol = nextRow - 100;
        nextRow = 149;
      }

      // Stop if we hit a wall.
      if (grid[nextRow][nextCol] === '#') {
        dr = cdr;
        dc = cdc;
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

  return 1000 * (row + 1) + 4 * (col + 1) + facing;
}

console.log(`The final password is ${solve1(grid, moves)}.`);
console.log(`After folding the map into a cube, the final password is ${solve2(grid, moves)}.`);

console.log(getProcessingTime(hrtime(startTime)));
