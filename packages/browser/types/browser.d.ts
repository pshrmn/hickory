import { ResponseHandler } from "@hickory/root";
import { BrowserHistoryOptions, BrowserHistory } from "./types";
export * from "./types";
export declare function browser(fn: ResponseHandler, options?: BrowserHistoryOptions): BrowserHistory;
