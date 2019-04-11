import { Key } from "./types/location";
import { KeyFns } from "./types/keyGenerator";

export default function createKeyGenerator(): KeyFns {
  let major: number = 0;

  return {
    major(previous?: Key): Key {
      if (previous) {
        major = previous[0] + 1;
      }
      return [major++, 0];
    },
    minor(current: Key): Key {
      return [current[0], current[1] + 1];
    }
  };
}
