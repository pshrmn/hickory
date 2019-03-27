import { ResponseHandler } from "@hickory/root";
import { HashOptions, HashHistory } from "./types";
export * from "./types";
export declare function hash(fn: ResponseHandler, options?: HashOptions): HashHistory;
