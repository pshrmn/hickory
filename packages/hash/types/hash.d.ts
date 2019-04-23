import { createBase } from "@hickory/root";
import { ResponseHandler } from "@hickory/root";
import { HashOptions, HashHistory } from "./types";
export * from "./types";
export { createBase };
export declare function hash(fn: ResponseHandler, options?: HashOptions): HashHistory;
