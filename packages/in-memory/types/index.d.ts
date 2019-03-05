import { ResponseHandler } from "@hickory/root";
import { InMemoryOptions, InMemoryHistory } from "./types";
export * from "./types";
export declare function InMemory(fn: ResponseHandler, options?: InMemoryOptions): InMemoryHistory;
