import { createBase } from "@hickory/root";
import { ResponseHandler } from "@hickory/root";
import { InMemoryOptions, InMemoryHistory } from "./types";
export * from "./types";
export { createBase };
export declare function inMemory(fn: ResponseHandler, options?: InMemoryOptions): InMemoryHistory;
