import { readFileSync } from 'fs';
import { join } from 'path';
import { getProcessingTime } from '../utils';
import { hrtime } from 'process';

const startTime = hrtime();

type Voxel = string;
type Droplet = Set<Voxel>;
type Bucket = { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } };

let bucket: Bucket = {
  min: { x: 0, y: 0, z: 0 },
  max: { x: 0, y: 0, z: 0 },
};

const droplet: Droplet = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .map((line) => {
    const [x, y, z] = line.split(',').map(Number);
    bucket.min.x = Math.min(bucket.min.x, x);
    bucket.max.x = Math.max(bucket.max.x, x);
    bucket.min.y = Math.min(bucket.min.y, y);
    bucket.max.y = Math.max(bucket.max.y, y);
    bucket.min.z = Math.min(bucket.min.z, z);
    bucket.max.z = Math.max(bucket.max.z, z);
    return [x, y, z];
  })
  .reduce((acc, [x, y, z]) => {
    acc.add(`${x},${y},${z}`);
    return acc;
  }, new Set<Voxel>());

function calcSurfaceArea(droplet: Droplet): number {
  let surfaceArea = droplet.size * 6;
  droplet.forEach((voxel) => {
    const [x, y, z] = voxel.split(',').map(Number);
    if (droplet.has(`${x - 1},${y},${z}`)) surfaceArea -= 1;
    if (droplet.has(`${x + 1},${y},${z}`)) surfaceArea -= 1;
    if (droplet.has(`${x},${y - 1},${z}`)) surfaceArea -= 1;
    if (droplet.has(`${x},${y + 1},${z}`)) surfaceArea -= 1;
    if (droplet.has(`${x},${y},${z - 1}`)) surfaceArea -= 1;
    if (droplet.has(`${x},${y},${z + 1}`)) surfaceArea -= 1;
  });
  return surfaceArea;
}

console.log(`The surface area is ${calcSurfaceArea(droplet)}.`);

function getEdgesToVisit(voxel: Voxel): { x: number; y: number; z: number }[] {
  const [x, y, z] = voxel.split(',').map(Number);
  return [
    { x: x + 1, y, z },
    { x: x - 1, y, z },
    { x, y: y - 1, z },
    { x, y: y + 1, z },
    { x, y, z: z - 1 },
    { x, y, z: z + 1 },
  ];
}

function dropInBucket(droplet: Droplet, bucket: Bucket, start: Voxel): number {
  let surfaceArea = 0;
  let visited = new Set<Voxel>();
  const { min, max } = bucket;
  const frontier: Voxel[] = [start];
  for (let i = 0; i < frontier.length; i++) {
    const voxel = frontier[i];
    for (const { x, y, z } of getEdgesToVisit(voxel)) {
      if (x < min.x - 1 || x > max.x + 1 || y < min.y - 1 || y > max.y + 1 || z < min.z - 1 || z > max.z + 1) {
        continue;
      }

      const key = `${x},${y},${z}`;
      if (droplet.has(key)) {
        surfaceArea++;
      } else if (!visited.has(key)) {
        frontier.push(key);
        visited.add(key);
      }
    }
  }

  return surfaceArea;
}

const start: Voxel = `${bucket.min.x - 1},${bucket.min.y - 1},${bucket.min.z - 1}`; // put a voxel just next to the droplet
console.log(`The exterior surface area is ${dropInBucket(droplet, bucket, start)}.`);

console.log(getProcessingTime(hrtime(startTime)));
