import { readFileSync } from 'fs';
import { join } from 'path';

function findMarker(data: string, length: number): number {
  let marker: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const c = data[i];
    const charIndex = marker.indexOf(c);
    if (charIndex != -1) {
      marker.splice(0, charIndex + 1);
    }
    marker.push(c);
    if (marker.length === length) {
      return i + 1;
    }
  }
  return -1;
}

const data = readFileSync(join(__dirname, 'input.txt'), { encoding: 'utf8' });

console.log(`The first start of packet marker is after character ${findMarker(data, 4)}.`);
console.log(`The first start of message marker is after character ${findMarker(data, 14)}.`);
