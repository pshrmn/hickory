import { Key } from "./types/location";
import { KeyFns } from "./types/keyGenerator";

export default function createKeyGenerator(): KeyFns {
  let currentMajor: number = 0;

  return {
    major: function(previous?: Key): Key {
      if (previous) {
        currentMajor = previous[0] + 1;
      }
      return [currentMajor++, 0];
    },
    minor: function(current: Key): Key {
      return [current[0], current[1] + 1];
    }
  };
}
