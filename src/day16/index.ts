import { readFileSync } from 'fs';
import { join } from 'path';

type Valve = { name: string; flowRate: number; neighbours: string[]; distances: Record<string, number> };
type Graph = Record<string, Valve>;

// https://en.wikipedia.org/wiki/Breadth-first_search
function calcDistances(valves: Graph, root: Valve): void {
  const queue: Valve[] = [root];
  const visited = new Set<string>([root.name]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbour of current.neighbours) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        root.distances[neighbour] = (root.distances[current.name] || 0) + 1;
        queue.push(valves[neighbour]);
      }
    }
  }
}

const valves: Graph = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .map<Valve>((l) => {
    const { valve, flowRate, neighbours } = l.match(
      /Valve (?<valve>[A-Z]{2}) has flow rate=(?<flowRate>[0-9]+); tunnels? leads? to valves? (?<neighbours>.*)/,
    )!.groups!;
    return {
      name: valve,
      flowRate: parseInt(flowRate),
      neighbours: neighbours.split(', '),
      distances: {},
    };
  })
  .reduce<Record<string, Valve>>((acc, curr) => {
    acc[curr.name] = curr;
    return acc;
  }, {});

for (const valve of Object.values(valves)) {
  calcDistances(valves, valve);
}

function addFlow(valves: Graph, openValves: string[]): number {
  let sum = 0;
  openValves.forEach((valve) => (sum += valves[valve].flowRate));
  return sum;
}

type Path = {
  name: string;
  timeLeft: number;
  pressure: number;
  openValves: string[];
  toVisit: string[];
};

let pressureReleased = 0;

const paths: Path[] = [
  {
    name: 'AA',
    timeLeft: 30,
    pressure: 0,
    openValves: [],
    toVisit: Object.values(valves)
      .filter((valve) => valve.flowRate > 0)
      .map((valve) => valve.name),
  },
];

for (let i = 0; i < paths.length; i++) {
  const current = paths[i];
  for (const valve of current.toVisit) {
    const steps = valves[current.name].distances[valve] + 1; // +1 for opening the valve
    if (current.timeLeft - steps <= 0) {
      const pressure = current.pressure + current.timeLeft * addFlow(valves, current.openValves);
      if (pressure > pressureReleased) {
        pressureReleased = pressure;
      }
    } else {
      paths.push({
        name: valve,
        timeLeft: current.timeLeft - steps,
        pressure: current.pressure + steps * addFlow(valves, current.openValves),
        openValves: [...current.openValves, valve],
        toVisit: current.toVisit.filter((v) => v !== valve),
      });
    }
  }
}

console.log(`The most pressure you can release is ${pressureReleased}.`);
