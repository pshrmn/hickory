import { ResponseHandler } from "@hickory/root";
import { InMemoryOptions, InMemoryHistory } from "./types";
export declare function in_memory(fn: ResponseHandler, options?: InMemoryOptions): InMemoryHistory;
