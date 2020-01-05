import { ResponseHandler } from "@hickory/root";
import { BrowserHistoryOptions, BlockingBrowserHistory } from "./types";
export declare function blockingBrowser(fn: ResponseHandler, options?: BrowserHistoryOptions): BlockingBrowserHistory;
