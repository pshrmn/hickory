import { ResponseHandler } from "@hickory/root";
import { HashOptions, BlockingHashHistory } from "./types";
export declare function blockingHash(fn: ResponseHandler, options?: HashOptions): BlockingHashHistory;
