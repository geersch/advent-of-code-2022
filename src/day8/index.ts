import { readFileSync } from 'fs';
import { join } from 'path';

type Tree = { x: number; y: number; value: number };
type Forest = Tree[][];
type ScenicScore = { visible: boolean; distance: number };

const forest: Forest = readFileSync(join(__dirname, 'input.txt'), 'utf8')
  .split(/\n/)
  .map((line, y) => line.split('').map((d, x) => ({ x, y, value: parseInt(d) })));

function isVisibleFromTop(forest: Forest, tree: Tree): ScenicScore {
  let distance = 0;
  for (let y = tree.y - 1; y >= 0; y--) {
    if (forest[y][tree.x].value >= tree.value) {
      return { visible: false, distance: distance + 1 };
    }
    distance += 1;
  }
  return { visible: true, distance };
}

function isVisibleFromBottom(forest: Forest, tree: Tree): ScenicScore {
  let distance = 0;
  tree.y < forest.length ? 1 : 0;
  for (let y = tree.y + 1; y <= forest.length - 1; y++) {
    if (forest[y][tree.x].value >= tree.value) {
      return { visible: false, distance: distance + 1 };
    }
    distance += 1;
  }
  return { visible: true, distance };
}

function isVisibleFromLeft(forest: Forest, tree: Tree): ScenicScore {
  let distance = 0;
  for (let x = tree.x - 1; x >= 0; x--) {
    if (forest[tree.y][x].value >= tree.value) {
      return { visible: false, distance: distance + 1 };
    }
    distance += 1;
  }
  return { visible: true, distance };
}

function isVisibleFromRight(forest: Forest, tree: Tree): ScenicScore {
  let distance = 0;
  for (let x = tree.x + 1; x <= forest[tree.y].length - 1; x++) {
    if (forest[tree.y][x].value >= tree.value) {
      return { visible: false, distance: distance + 1 };
    }
    distance += 1;
  }
  return { visible: true, distance };
}

function calcScenicScore(forest: Forest, tree: Tree): { visible: boolean; scenicScore: number } {
  const top = isVisibleFromTop(forest, tree);
  const bottom = isVisibleFromBottom(forest, tree);
  const left = isVisibleFromLeft(forest, tree);
  const right = isVisibleFromRight(forest, tree);
  const scenicScore = top.distance * bottom.distance * left.distance * right.distance;
  return { visible: top.visible || bottom.visible || left.visible || right.visible, scenicScore };
}

const trees = forest
  .flatMap((tree) => tree)
  .reduce(
    (acc, tree) => {
      const { visible, scenicScore } = calcScenicScore(forest, tree);
      if (visible) {
        acc.visible += visible ? 1 : 0;
      }
      if (scenicScore > acc.scenicScore) {
        acc.scenicScore = scenicScore;
      }
      return acc;
    },
    { visible: 0, scenicScore: 0 },
  );

console.log(`There are ${trees.visible} trees visible from outside the grid.`);
console.log(`The highest scenic score possible is ${trees.scenicScore}.`);
