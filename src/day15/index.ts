import { readFileSync } from 'fs';
import { join } from 'path';

type Point = { x: number; y: number };
type Sensor = {
  position: Point;
  beacon: Point;
};

const data = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .map((l) => {
    const matches = l.match(/([-0-9]+)/g);
    return matches!.map((x) => parseInt(x));
  });

const ROW = 2000000;

const sensors: Sensor[] = [];
type Intersection = { from: number; to: number };
const intersections: Intersection[] = [];
for (const [x1, y1, x2, y2] of data) {
  // Calculate the Manhattan distance.
  let distance = Math.abs(x1 - x2) + Math.abs(y1 - y2);

  // Skip if there is no overlap with the row.
  const rowDistance = Math.abs(y1 - ROW);
  if (rowDistance > distance) {
    continue;
  }

  // Calculate the width of the intersection with the row.
  intersections.push({ from: x1 - (distance - rowDistance), to: x1 + (distance - rowDistance) });

  sensors.push({
    position: { x: x1, y: y1 },
    beacon: { x: x2, y: y2 },
  });
}

intersections.sort((a, b) => a.from - b.from);

// Merge the intersections that overlap, so we have distinct intersections.
const [first, ...rest] = intersections;
const distinctIntersections: Intersection[] = [first];
rest.forEach((intersection) => {
  const previous = distinctIntersections[distinctIntersections.length - 1];
  if (intersection.from <= previous.to) {
    previous.to = Math.max(previous.to, intersection.to);
  } else {
    distinctIntersections.push(intersection);
  }
});

// Count the number of positions that cannot have a beacon.
let total = distinctIntersections.reduce((acc, curr) => (acc += curr.to - curr.from + 1), 0);

// Subtract any unique beacons on the row.
const beacons = new Set<number>();
sensors.filter((sensor) => sensor.beacon.y === ROW).forEach((sensor) => beacons.add(sensor.beacon.x));
total -= beacons.size;

console.log(`On row ${ROW} ${total} positions cannot contain have a beacon.`); // 4748135
