import { HistoryConstructor, HistoryOptions, History, LocationComponents, SessionLocation, PartialLocation, Hrefable } from "@hickory/root";
export { HistoryConstructor, HistoryOptions, History, SessionLocation, PartialLocation, Hrefable, LocationComponents };
export declare type InputLocations = Array<Hrefable>;
export interface SessionOptions {
    locations?: InputLocations;
    index?: number;
}
export declare type InMemoryOptions = HistoryOptions & SessionOptions;
export interface InMemoryHistory extends History {
    reset(options?: SessionOptions): void;
}
export interface LocationOptions {
    location: Hrefable;
}
