import { ResponseHandler } from "@hickory/root";
import { HashOptions, BlockingHashHistory } from "./types";
export declare function blocking_hash(fn: ResponseHandler, options?: HashOptions): BlockingHashHistory;
