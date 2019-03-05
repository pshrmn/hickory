import { ResponseHandler } from "@hickory/root";
import { InMemoryLiteOptions, InMemoryLiteHistory } from "./types";
export declare function InMemoryLite(fn: ResponseHandler, options: InMemoryLiteOptions): InMemoryLiteHistory;
