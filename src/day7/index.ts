import { readFileSync } from 'fs';
import { join } from 'path';

type File = { name: string; size: number };
type Directory = { name: string; files: (File | Directory)[]; parent?: Directory };

function isDirectory(file: File | Directory): file is Directory {
  return (file as Directory).files !== undefined;
}

const root: Directory = { name: '.', files: [] };

let cwd = root;
for (const line of readFileSync(join(__dirname, 'input.txt'), 'utf8').split(/\n/)) {
  if (/^\$ cd (.*)$/g.test(line)) {
    const matches = line.match(/^\$ cd (?<dir>.*)$/);
    if (matches?.groups) {
      const dir = matches.groups.dir;
      if (dir === '/') {
        cwd = root;
      } else if (dir === '..') {
        cwd = cwd.parent || root;
      } else {
        cwd = cwd.files.filter((f) => isDirectory(f)).find((f) => f.name === dir) as Directory;
      }
    }
  } else {
    let matches = /dir (.*)$/g.exec(line);
    if (matches) {
      cwd.files.push({ name: matches[1], files: [], parent: cwd });
    } else {
      matches = /([0-9]+) (.*)/.exec(line);
      if (matches) {
        cwd.files.push({ name: matches[2], size: parseInt(matches[1]) });
      }
    }
  }
}

function calculateSize(directory: Directory): number {
  return directory.files.reduce((acc, file) => (acc += isDirectory(file) ? calculateSize(file) : file.size), 0);
}

function calcDirSizes(directory: Directory): { name: string; size: number }[] {
  return directory.files
    .reduce<{ name: string; size: number }[]>((acc, file) => {
      if (isDirectory(file)) {
        acc.push({ name: file.name, size: calculateSize(file) });
        acc.push(...calcDirSizes(file));
      }
      return acc;
    }, [])
    .sort((a, b) => a.size - b.size);
}

const dirs = calcDirSizes(root);

const size = dirs.reduce((acc, current) => (acc += current.size <= 100000 ? current.size : 0), 0);
console.log(`The total size of all directories with a total size of at most 100000 is ${size}.`);

const requiredSpace = 30000000 - (70000000 - calculateSize(root));
const dirToDelete = dirs.filter((d) => d.size >= requiredSpace)[0];
console.log(`The directory to delete is ${dirToDelete.name}, size ${dirToDelete.size}.`);
