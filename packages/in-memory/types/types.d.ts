import { PendingHistory, History, LocationComponents, SessionLocation, PartialLocation, RawLocation, AnyLocation, LocationUtilOptions } from "@hickory/root";
export { PendingHistory, History, SessionLocation, PartialLocation, AnyLocation, RawLocation, LocationComponents };
export declare type InputLocation = string | PartialLocation;
export declare type InputLocations = Array<InputLocation>;
export interface SessionOptions {
    locations?: InputLocations;
    index?: number;
}
export declare type Options = LocationUtilOptions & SessionOptions;
export interface SessionHistory {
    reset(options?: SessionOptions): void;
}
export declare type InMemoryHistory = History & SessionHistory;
export declare type PendingInMemoryHistory = PendingHistory<InMemoryHistory>;
