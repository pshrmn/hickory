import { KeyMethods } from "./types/keygen";
import { Key } from "./types/location";

export default function createKeyGenerator(initial?: number): KeyMethods {
  let id: number = initial || 0;

  function parse(key: Key): Array<number> {
    return key.split(".").map((value: string): number => parseInt(value, 10));
  }

  return {
    keygen: {
      major: function(previous?: Key): Key {
        if (previous) {
          let [major] = parse(previous);
          id = major + 1;
        }
        return `${id++}.0`;
      },
      minor: function(current: Key): Key {
        let [major, minor] = parse(current);
        return `${major}.${minor + 1}`;
      },
      diff: function(first: Key, second: Key): number {
        const [firstMajor] = parse(first);
        const [secondMajor] = parse(second);
        return secondMajor - firstMajor;
      }
    }
  };
}
