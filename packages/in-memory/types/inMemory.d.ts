import { ResponseHandler } from "@hickory/root";
import { InMemoryOptions, InMemoryHistory } from "./types";
export declare function inMemory(fn: ResponseHandler, options?: InMemoryOptions): InMemoryHistory;
