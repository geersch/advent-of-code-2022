import { readFileSync } from 'fs';
import { join } from 'path';

type Motion = { direction: string; distance: number };

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

enum Direction {
  Right,
  Left,
  Up,
  Down,
}

type Point = { x: number; y: number };

class Rope {
  private readonly trail = new Set<string>(['0,0']);
  public readonly knots: Point[] = [];

  constructor(length: number) {
    this.knots = Array.from({ length }, () => ({ x: 0, y: 0 }));
  }

  private moveAdjacent(tail: Point, head: Point): Point | undefined {
    let dx = tail.x - head.x;
    let dy = tail.y - head.y;
    if ((dx === 2 || dx === -2) && (dy === 2 || dy === -2)) {
      return { x: head.x + clamp(dx, -1, 1), y: head.y + clamp(dy, -1, 1) };
    } else if (dx === 2 || dx === -2) {
      return { x: head.x + clamp(dx, -1, 1), y: head.y };
    } else if (dy === 2 || dy === -2) {
      return { x: head.x, y: head.y + clamp(dy, -1, 1) };
    }
    return undefined;
  }

  move(direction: Direction, distance: number): void {
    let delta: Point;
    switch (direction) {
      case Direction.Right:
        delta = { x: 1, y: 0 };
        break;
      case Direction.Left:
        delta = { x: -1, y: 0 };
        break;
      case Direction.Up:
        delta = { x: 0, y: 1 };
        break;
      case Direction.Down:
        delta = { x: 0, y: -1 };
        break;
    }

    for (let i = 0; i < distance; i++) {
      this.knots[0].x += delta.x;
      this.knots[0].y += delta.y;
      for (let j = 1; j < this.knots.length; j++) {
        const knot = this.knots[j];
        const moveTo = this.moveAdjacent(knot, this.knots[j - 1]);
        if (!moveTo) {
          break;
        }
        knot.x = moveTo.x;
        knot.y = moveTo.y;

        const tail = this.knots[this.knots.length - 1];
        this.trail.add(`${tail.x},${tail.y}`);
      }
    }
  }

  get trailLength(): number {
    return this.trail.size;
  }
}

const motions = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .reduce<Motion[]>((acc, curr) => {
    const matches = curr.match(/([RULD]) ([0-9]+)/)!;
    acc.push({ direction: matches[1], distance: parseInt(matches[2]) });
    return acc;
  }, []);

const shortRope = new Rope(2);
const longRope = new Rope(10);
for (const motion of motions) {
  switch (motion.direction) {
    case 'R':
      shortRope.move(Direction.Right, motion.distance);
      longRope.move(Direction.Right, motion.distance);
      break;
    case 'L':
      shortRope.move(Direction.Left, motion.distance);
      longRope.move(Direction.Left, motion.distance);
      break;
    case 'U':
      shortRope.move(Direction.Up, motion.distance);
      longRope.move(Direction.Up, motion.distance);
      break;
    case 'D':
      shortRope.move(Direction.Down, motion.distance);
      longRope.move(Direction.Down, motion.distance);
      break;
  }
}

console.log(`The tail of the short rope visited ${shortRope.trailLength} positions.`);
console.log(`The tail of the long rope visited ${longRope.trailLength} positions.`);
