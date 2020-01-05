import { HistoryConstructor, HistoryOptions, History, URLWithState, LocationComponents, SessionLocation, PartialLocation, Hrefable, BlockingHistory } from "@hickory/root";
export { HistoryConstructor, HistoryOptions, History, SessionLocation, PartialLocation, URLWithState, Hrefable, LocationComponents };
export declare type InputLocations = Array<URLWithState>;
export interface SessionOptions {
    locations?: InputLocations;
    index?: number;
}
export declare type InMemoryOptions = HistoryOptions & SessionOptions;
export interface InMemoryHistory extends History {
    reset(options?: SessionOptions): void;
}
export declare type BlockingInMemoryHistory = InMemoryHistory & BlockingHistory;
export interface LocationOptions {
    location: URLWithState;
}
