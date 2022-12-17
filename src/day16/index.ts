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

type Node = {
  name: string;
  time: number;
  pressure: number;
  openValves: Record<string, number>; // Remember what minute the valves were opened
};

let pressureReleased = 0;

const queue: Node[] = [
  {
    name: 'AA',
    time: 30,
    pressure: 0,
    openValves: {},
  },
];

function addFlow(valves: Graph, openValves: Record<string, number>) {
  let sum = 0;
  for (const key in openValves) {
    sum += valves[key].flowRate;
  }
  return sum;
}

while (queue.length > 0) {
  const current = queue.shift()!;

  // What are the non-opened valves, with a non-zero flow rate I can still open for this node?
  const options = Object.values(valves).filter((valve) => valve.flowRate > 0 && !current.openValves[valve.name]);
  if (options.length === 0) {
    const pressure = current.pressure + current.time * addFlow(valves, current.openValves);
    if (pressure > pressureReleased) {
      pressureReleased = pressure;
    }
    continue;
  }

  for (const valve of options) {
    const steps = valves[current.name].distances[valve.name] + 1; // +1 for opening the valve
    // Is there still time left?
    if (current.time - steps <= 0) {
      const pressure = current.pressure + current.time * addFlow(valves, current.openValves);
      if (pressure > pressureReleased) {
        pressureReleased = pressure;
      }
    } else {
      queue.push({
        name: valve.name,
        time: current.time - steps,
        pressure: current.pressure + steps * addFlow(valves, current.openValves),
        openValves: { ...current.openValves, [valve.name]: current.time - steps },
      });
    }
  }
}

console.log(`The most pressure you can release is ${pressureReleased}.`);

// A naive attempt which happened to work for the sample, sigh.

// function getNeighbours(valves: Valve[], valve: Valve): Valve[] {
//   return valve.neighbours.map((tunnel) => valves.find((v) => v.name === tunnel)!);
// }

// function plotRoute(valves: Valve[], start: Valve, destination: Valve): number {
//   const queue: { valve: Valve; cost: number }[] = [{ valve: start, cost: 0 }];
//   const visited = new Set<string>([`${start.name}`]);
//   while (queue.length) {
//     const { cost, valve } = queue.shift()!;
//     if (valve.name === destination.name) {
//       return cost;
//     }

//     getNeighbours(valves, valve).forEach((neighbour) => {
//       if (!visited.has(neighbour.name)) {
//         visited.add(neighbour.name);
//         queue.push({ valve: neighbour, cost: cost + 1 });
//         queue.sort((a, b) => a.cost - b.cost);
//       }
//     });
//   }

//   return -1; // no route
// }

// function findNextDestination(valves: Valve[], start: Valve): { valve: Valve; cost: number } | undefined {
//   //   console.log(`You are currently at valve ${start.name}.`);
//   let costs: { valve: Valve; cost: number; gain: number }[] = [];
//   for (const valve of valves.filter((v) => v.name !== start.name && !v.open && v.flowRate > 0)) {
//     const cost = plotRoute(valves, start, valve);
//     const gain = Math.ceil(valve.flowRate / cost);
//     costs.push({ valve, cost, gain });
//   }
//   costs.sort((a, b) => b.gain - a.gain);
//   costs = costs.filter((c) => c.gain === costs[0].gain).sort((a, b) => a.cost - b.cost);

//   return costs.length ? { valve: costs[0].valve, cost: costs[0].cost } : undefined;
// }

// let start = valves.find((valve) => valve.name === 'AA')!;

// let pressureReleased = 0;

// let openValves: Valve[] = [];
// let minute = 1;
// let destination: { valve: Valve; cost: number } | undefined;
// while (minute <= 30) {
//   console.log(`== Minute ${minute} ==`);

//   openValves.forEach((v) => {
//     pressureReleased += v.flowRate;
//   });

//   if (!destination || destination.valve.open) {
//     destination = findNextDestination(valves, start);
//   }

//   if (destination) {
//     if (destination.cost > 0) {
//       console.log(`You move towards valve ${destination.valve.name}.`);
//     } else {
//       console.log(`You open valve ${destination.valve.name}.`);
//       destination.valve.open = true;
//       openValves.push(destination.valve);
//       start = destination.valve;
//     }
//     destination.cost -= 1;
//   }

//   minute++;
// }
