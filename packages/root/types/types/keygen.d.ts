import { Key } from "./location";
export interface KeyMethods {
  keygen: KeyFns;
}
export interface KeyFns {
  major(previous?: Key): Key;
  minor(current: Key): Key;
  diff(first: Key, second: Key): number;
}
