import { readFileSync } from 'fs';
import { join } from 'path';
import { hrtime } from 'process';
import { getProcessingTime } from '../utils';

const start = hrtime();

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

type Solution = { pressure: number; visited: string[] };

type Path = {
  name: string;
  timeLeft: number;
  pressure: number;
  openValves: string[];
  toVisit: string[];
};

function solve(valves: Graph, start: Valve, timeLeft: number): Solution[] {
  const solutions: Solution[] = [];
  const paths: Path[] = [
    {
      name: start.name,
      timeLeft: timeLeft,
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
        solutions.push({
          pressure: current.pressure + current.timeLeft * addFlow(valves, current.openValves),
          visited: current.openValves,
        });
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

  return solutions.sort((a, b) => b.pressure - a.pressure);
}

let { 0: solution1 } = solve(valves, valves['AA'], 30);
console.log(`The most pressure you can release in 30 minutes is ${solution1.pressure}.`);

// Part 2
// - Calculate all the solutions for 26 minutes.
// - Iterate over all the solutions and compare them
//   against all other solutions of which the visited valves
//   have no intersection.
// - It their combined released pressure is higher than the previous
//   max store it.
// - Abort both loops as soon as possible.

const solutions = solve(valves, valves['AA'], 26);

let solution2 = 0;
for (let i = 0; i < solutions.length; i++) {
  const current = solutions[i];
  // Stop this iteration as soon as the double of the current pressure can no longer exceed the maximum.
  if (current.pressure * 2 < solution2) {
    break;
  }

  for (let j = 1; j < solutions.length; j++) {
    const next = solutions[j];
    // Stop this iteration as soon as we cannot exceed the maximum.
    if (current.pressure + next.pressure < solution2) {
      break;
    }
    if (
      current.pressure + next.pressure > solution2 &&
      current.visited.every((valve) => !next.visited.includes(valve))
    ) {
      solution2 = current.pressure + next.pressure;
    }
  }
}

console.log(`The most pressure you can release in 26 minutes with the help of an elephant is ${solution2}.`);

console.log(getProcessingTime(hrtime(start)));
