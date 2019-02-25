import { History, LocationComponents, PartialLocation, SessionLocation, AnyLocation, Location, LocationUtilOptions } from "@hickory/root";
export { History, SessionLocation, PartialLocation, AnyLocation, Location, LocationComponents };
export declare type InputLocation = string | PartialLocation;
export declare type InputLocations = Array<InputLocation>;
export interface SessionOptions {
    locations?: InputLocations;
    index?: number;
}
export declare type Options = LocationUtilOptions & SessionOptions;
export interface SessionHistory {
    locations: Array<SessionLocation>;
    index: number;
    reset(options?: SessionOptions): void;
}
export declare type InMemoryHistory = History & SessionHistory;
