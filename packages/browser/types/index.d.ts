import { ResponseHandler } from "@hickory/root";
import { BrowserHistoryOptions, BrowserHistory } from "./types";
export * from "./types";
export declare function Browser(fn: ResponseHandler, options?: BrowserHistoryOptions): BrowserHistory;
