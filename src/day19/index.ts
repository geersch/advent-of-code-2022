import { getProcessingTime } from '../utils';
import { hrtime } from 'process';
import { readFileSync } from 'fs';
import { join } from 'path';

const startTime = hrtime();

const blueprintRe = /([\d]+)/g;

type Recipe = number[]; // order: ore, clay and obsidian

type BluePrint = {
  robots: Recipe[]; // order: ore, clay, obsidian and geode
  maxSpend: number[]; // order: ore, clay and obsidian
};

// Thanks to hyper-neutrino (https://www.youtube.com/watch?v=H3PSODv4nf0)
function dfs(
  blueprint: BluePrint,
  timeLeft: number,
  cache: Record<string, number>,
  bots: number[],
  resources: number[],
) {
  // If there is no time left, then the amount of geodes we can crack if the amount we already have.
  if (timeLeft === 0) {
    return resources[3];
  }

  const key = `${timeLeft}_${bots.join('_')}_${resources.join('_')}`;
  if (cache[key]) {
    return cache[key];
  }

  // Geodes we currently have + timeLeft * geode-cracking robots.
  let max = resources[3] + bots[3] * timeLeft;

  for (const [botType, recipe] of blueprint.robots.entries()) {
    // Do not produce more of this bot type if we already have enough of them
    // to produce the maximum of that resource that we can spend on any particular bot.
    if (botType !== 3 && bots[botType] >= blueprint.maxSpend[botType]) {
      continue;
    }

    // How long do we have to wait to build this robot? Advance to that state.
    let wait = 0;
    let skip = false;
    for (const [type, amount] of recipe.entries()) {
      // Do we need resources of this type?
      if (amount === 0) {
        continue;
      }
      // Are there bots available that can produce this type?
      if (bots[type] === 0) {
        skip = true;
        break;
      }
      wait = Math.max(wait, Math.ceil((amount - resources[type]) / bots[type]));
    }
    if (!skip) {
      const remainingTime = timeLeft - wait - 1;
      if (remainingTime <= 0) {
        continue;
      }
      const botsCopy = [...bots];
      const resourcesCopy = [...resources];
      // Advance by X (wait) minutes.
      resources.forEach((resource, index) => {
        resourcesCopy[index] = resource + bots[index] * (wait + 1);
      });
      recipe.forEach((amount, type) => {
        resourcesCopy[type] -= amount;
      });
      botsCopy[botType] += 1;

      // Throw away excess resources. Only keep the maximum spend rate times the time remaining, anymore cannot
      // be used and only increases the scope.
      for (let i = 0; i < 3; i++) {
        resourcesCopy[i] = Math.min(resourcesCopy[i], blueprint.maxSpend[i] * remainingTime);
      }

      max = Math.max(max, dfs(blueprint, remainingTime, cache, botsCopy, resourcesCopy));
    }
  }

  cache[key] = max;
  return max;
}

const blueprints = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .map<BluePrint>((line) => {
    const matches = line.match(blueprintRe)!;
    const ore = [parseInt(matches[1]), 0, 0];
    const clay = [parseInt(matches[2]), 0, 0];
    const obsidian = [parseInt(matches[3]), parseInt(matches[4]), 0];
    const geode = [parseInt(matches[5]), 0, parseInt(matches[6])];
    return {
      robots: [ore, clay, obsidian, geode],
      maxSpend: [Math.max(ore[0], clay[0], obsidian[0], geode[0]), obsidian[1], geode[2]],
    };
  });

let qualityLevel = 0;
blueprints.forEach((blueprint, index) => {
  const geodes = dfs(blueprint, 24, {}, [1, 0, 0, 0], [0, 0, 0, 0]);
  qualityLevel += (index + 1) * geodes;
});

console.log(`The sum of the quality levels of all blueprints is ${qualityLevel}.`);

let total = 1;
blueprints.slice(0, 3).forEach((blueprint) => {
  total *= dfs(blueprint, 32, {}, [1, 0, 0, 0], [0, 0, 0, 0]);
});

console.log(`The total geodes that can be cracked in 32 minutes with the first 3 blueprints is ${total}.`);

console.log(getProcessingTime(hrtime(startTime)));
