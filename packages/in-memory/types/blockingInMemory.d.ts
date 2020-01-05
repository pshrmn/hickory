import { ResponseHandler } from "@hickory/root";
import { InMemoryOptions, BlockingInMemoryHistory } from "./types";
export declare function blockingInMemory(fn: ResponseHandler, options?: InMemoryOptions): BlockingInMemoryHistory;
