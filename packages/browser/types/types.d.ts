import { HistoryConstructor, HistoryOptions, History, LocationComponents, SessionLocation, PartialLocation, Hrefable, ConfirmationFunction } from "@hickory/root";
export { HistoryConstructor, HistoryOptions, History, SessionLocation, PartialLocation, Hrefable, LocationComponents };
export declare type BrowserHistoryOptions = HistoryOptions;
export declare type BrowserHistory = History;
export interface BlockingBrowserHistory extends BrowserHistory {
    confirmWith(fn?: ConfirmationFunction): void;
    removeConfirmation(): void;
}
