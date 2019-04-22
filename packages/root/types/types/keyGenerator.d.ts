import { Key } from "./location";
export interface KeyFns {
    major(previous?: Key): Key;
    minor(current: Key): Key;
}
