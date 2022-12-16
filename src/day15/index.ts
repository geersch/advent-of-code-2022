import { readFileSync } from 'fs';
import { join } from 'path';

type Point = { x: number; y: number };
type Sensor = {
  position: Point;
  beacon: Point;
  distance: number;
};
type Intersection = { from: number; to: number };

const sensors: Sensor[] = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .map((l) => {
    const matches = l.match(/([-0-9]+)/g);
    return matches!.map(Number);
  })
  .map(([x1, y1, x2, y2]) => ({
    position: { x: x1, y: y1 },
    beacon: { x: x2, y: y2 },
    distance: Math.abs(x1 - x2) + Math.abs(y1 - y2), // Calculate the Manhattan distance.
  }));

function getRowIntersections(sensors: Sensor[], row: number): Intersection[] {
  const intersections: Intersection[] = [];
  for (const sensor of sensors) {
    // Skip if there is no overlap with the row.
    const rowDistance = Math.abs(sensor.position.y - row);
    if (rowDistance > sensor.distance) {
      continue;
    }

    // Calculate the width of the intersection with the row.
    intersections.push({
      from: sensor.position.x - (sensor.distance - rowDistance),
      to: sensor.position.x + (sensor.distance - rowDistance),
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

  return distinctIntersections;
}

function getBeaconsOnRow(sensors: Sensor[], row: number): number {
  const beacons = new Set<number>();
  sensors.filter((sensor) => sensor.beacon.y === row).forEach((sensor) => beacons.add(sensor.beacon.x));
  return beacons.size;
}

function findTheGap(intersections: Intersection[]): number {
  for (let i = 1; i < intersections.length; i++) {
    const previous = intersections[i - 1];
    const next = intersections[i];
    if (Math.abs(previous.to - next.from) > 0) {
      return previous.to + 1;
    }
  }

  return -1; // no gap
}

function getTuningFrequence(sensors: Sensor[], searchArea: number): number {
  for (let y = 0; y <= searchArea; y++) {
    const intersections = getRowIntersections(sensors, y);
    let gap = findTheGap(intersections);
    if (gap !== -1) {
      return gap * 4_000_000 + y;
    }
  }
  return -1;
}

// Count the number of positions that cannot have a beacon.
let total =
  getRowIntersections(sensors, 2_000_000).reduce((acc, curr) => (acc += curr.to - curr.from + 1), 0) -
  getBeaconsOnRow(sensors, 2_000_000);
console.log(`On row ${2_000_000} ${total} positions cannot contain have a beacon.`); // 4748135

console.log(`The turning frequence is ${getTuningFrequence(sensors, 4_000_000)}.`);
