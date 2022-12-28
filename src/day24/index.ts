import { readFileSync } from 'fs';
import { join } from 'path';
import { hrtime } from 'process';
import { getProcessingTime } from '../utils';

const startTime = hrtime();

type Point = { row: number; col: number };
type Tile = { type: 'ground' | 'wall' };
type Blizzard = { row: number; col: number; direction: string };
type Map = { tiles: Tile[][]; blizzards: Blizzard[] };

const map = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .filter(Boolean)
  .reduce<Map>(
    (acc, line, row) => {
      acc.tiles.push([]);
      line.split('').forEach((item, col) => {
        acc.tiles[row].push({ type: item === '#' ? 'wall' : 'ground' }); // blizzards only move over ground tiles
        if (['^', 'v', '<', '>'].includes(item)) {
          acc.blizzards.push({ row, col, direction: item });
        }
      });
      return acc;
    },
    { tiles: [], blizzards: [] },
  );

function mod(n: number, d: number): number {
  return ((n % d) + d) % d;
}

function getBlizzardForecast(map: Map, maxTime: number): Set<string> {
  const forecast = new Set<string>();
  const maxWidth = map.tiles[0].length - 2;
  const maxHeight = map.tiles.length - 2;
  for (let minute = 0; minute <= maxTime; minute++) {
    for (const blizzard of map.blizzards) {
      let row = blizzard.row;
      let col = blizzard.col;
      const diff = blizzard.direction == '^' || blizzard.direction === '<' ? minute * -1 : minute;
      if (blizzard.direction == '<' || blizzard.direction === '>') {
        col = mod(blizzard.col + diff, maxWidth);
      } else {
        row = mod(blizzard.row + diff, maxHeight);
      }
      forecast.add(`${row === 0 ? maxHeight : row},${col === 0 ? maxWidth : col},${minute}`);
    }
  }
  return forecast;
}

function getNeighbours(tiles: Tile[][], { row, col }: Point): Point[] {
  return [
    { row, col },
    ...(row > 0 && tiles[row - 1][col].type === 'ground' ? [{ row: row - 1, col }] : []),
    ...(row < tiles.length - 1 && tiles[row + 1][col].type === 'ground' ? [{ row: row + 1, col }] : []),
    ...(col > 0 && tiles[row][col - 1].type === 'ground' ? [{ row, col: col - 1 }] : []),
    ...(col < tiles[row].length - 1 && tiles[row][col + 1].type === 'ground' ? [{ row, col: col + 1 }] : []),
  ];
}

function solve(tiles: Tile[][], blizzards: Set<string>, start: Point, end: Point, startTime: number): number {
  const paths: { position: Point; minute: number }[] = [{ position: start, minute: startTime }];
  let visited = new Set<string>([`${start.row},${start.col},0`]);
  for (let i = 0; i < paths.length; i++) {
    const current = paths[i];
    const neighbours = getNeighbours(tiles, current.position);
    for (let neighbour of neighbours) {
      if (neighbour.row === end.row && neighbour.col === end.col) {
        return current.minute + 1 - startTime; // duration of the trip
      }
      const key = `${neighbour.row},${neighbour.col},${current.minute + 1}`;
      if (visited.has(key) || blizzards.has(key)) {
        continue;
      }
      paths.push({ position: neighbour, minute: current.minute + 1 });
      visited.add(key);
    }
  }
  throw new Error('You were killed by a blizzard.');
}

const start: Point = { row: 0, col: 1 };
const end: Point = { row: map.tiles.length - 1, col: map.tiles[map.tiles.length - 1].length - 2 };

const futureBlizzards = getBlizzardForecast(map, 816); // predict the weather for the next X minutes

const firstTrip = solve(map.tiles, futureBlizzards, start, end, 0);
console.log(`It takes ${firstTrip} minutes to reach the goal.`);

const secondTrip = solve(map.tiles, futureBlizzards, end, start, firstTrip);
const thirdTrip = solve(map.tiles, futureBlizzards, start, end, firstTrip + secondTrip);
console.log(
  `It takes ${firstTrip + secondTrip + thirdTrip} minutes to reach the goal, go back and reach the goal again.`,
);

console.log(getProcessingTime(hrtime(startTime)));
