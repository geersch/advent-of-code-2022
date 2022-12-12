import { readFileSync } from 'fs';
import { filter } from 'lodash';
import { join } from 'path';

type Point = { x: number; y: number; height: number; elevation: string };

const grid: Point[][] = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .map((line, row) =>
    line.split('').map((elevation, col) => {
      let height: number;
      if (elevation === 'S') {
        height = 1;
      } else if (elevation === 'E') {
        height = 26;
      } else {
        height = elevation.charCodeAt(0) - 96;
      }
      return { x: col, y: row, height, elevation };
    }),
  );

function getNeighbours(grid: Point[][], { x, y }: Point): Point[] {
  return [
    ...(y > 0 ? [grid[y - 1][x]] : []),
    ...(y < grid.length - 1 ? [grid[y + 1][x]] : []),
    ...(x > 0 ? [grid[y][x - 1]] : []),
    ...(x < grid[y].length - 1 ? [grid[y][x + 1]] : []),
  ];
}

const { 0: start, 1: end } = grid
  .flat()
  .filter((p) => p.elevation === 'S' || p.elevation === 'E')
  .sort((a, b) => a.height - b.height);

function plotRoute(grid: Point[][], start: Point, end: Point): number {
  const queue: { point: Point; cost: number }[] = [{ point: start, cost: 0 }];
  const visited = new Set<string>([`${start.x},${start.y}`]);
  while (queue.length) {
    const { cost, point } = queue.shift()!;
    if (point.x === end.x && point.y === end.y) {
      return cost;
    }

    getNeighbours(grid, point)
      .filter((neighbour) => neighbour.height <= point.height + 1)
      .forEach((neighbour) => {
        const key = `${neighbour.x},${neighbour.y}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ cost: cost + 1, point: neighbour });
          queue.sort((a, b) => a.cost - b.cost);
        }
      });
  }

  return -1; // no route
}

const shortestRoute = grid
  .flat()
  .filter((p) => p.height === 1)
  .reduce<number[]>((acc, start) => {
    const route = plotRoute(grid, start, end);
    if (route !== -1) {
      acc.push(route);
    }
    return acc;
  }, [])
  .sort((a, b) => a - b)
  .slice(0, 1);

console.log(`The fewest steps required from the original starting position is ${plotRoute(grid, start, end)} steps.`);
console.log(`The fewest steps required from any starting point is ${shortestRoute} steps.`);
