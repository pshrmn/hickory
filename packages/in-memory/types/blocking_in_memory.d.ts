import { ResponseHandler } from "@hickory/root";
import { InMemoryOptions, BlockingInMemoryHistory } from "./types";
export declare function blocking_in_memory(fn: ResponseHandler, options?: InMemoryOptions): BlockingInMemoryHistory;
