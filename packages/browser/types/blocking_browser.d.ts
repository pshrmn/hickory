import { ResponseHandler } from "@hickory/root";
import { BrowserHistoryOptions, BlockingBrowserHistory } from "./types";
export declare function blocking_browser(fn: ResponseHandler, options?: BrowserHistoryOptions): BlockingBrowserHistory;
