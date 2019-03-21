import { HistoryConstructor, HistoryOptions, History, LocationComponents, SessionLocation, PartialLocation, AnyLocation } from "@hickory/root";
export { HistoryConstructor, HistoryOptions, History, SessionLocation, PartialLocation, AnyLocation, LocationComponents };
export declare type InputLocation = string | PartialLocation;
export declare type InputLocations = Array<InputLocation>;
export interface SessionOptions {
    locations?: InputLocations;
    index?: number;
}
export declare type InMemoryOptions = HistoryOptions & SessionOptions;
export interface InMemoryHistory extends History {
    reset(options?: SessionOptions): void;
}
export interface LocationOptions {
    location: InputLocation;
}
