import { Key } from "./types/location";
import { KeyFns } from "./types/key_generator";

export default function create_key_generator(): KeyFns {
  let current_major: number = 0;

  return {
    major(previous?: Key): Key {
      if (previous) {
        current_major = previous[0] + 1;
      }
      return [current_major++, 0];
    },
    minor(current: Key): Key {
      return [current[0], current[1] + 1];
    }
  };
}
