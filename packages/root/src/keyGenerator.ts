import { KeyFns } from "./types/keyGenerator";

function parse(key: string): Array<number> {
  return key.split(".").map((value: string): number => parseInt(value, 10));
}

function diff(first: string, second: string): number {
  return parse(second)[0] - parse(first)[0];
}

function minor(current: string): string {
  const [major, minor] = parse(current);
  return `${major}.${minor + 1}`;
}

export default function createKeyGenerator(): KeyFns {
  let currentMajor: number = 0;

  return {
    major: function(previous?: string): string {
      if (previous) {
        currentMajor = parse(previous)[0] + 1;
      }
      return `${currentMajor++}.0`;
    },
    minor,
    diff
  };
}
