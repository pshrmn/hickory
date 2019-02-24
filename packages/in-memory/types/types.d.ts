import { History, LocationComponents, PartialLocation, SessionLocation, AnyLocation, Location, LocationUtilOptions } from "@hickory/root";
export { History, SessionLocation, PartialLocation, AnyLocation, Location, LocationComponents };
export declare type InputLocation<Q> = string | PartialLocation<Q>;
export declare type InputLocations<Q> = Array<InputLocation<Q>>;
export interface SessionOptions<Q> {
    locations?: InputLocations<Q>;
    index?: number;
}
export declare type Options<Q> = LocationUtilOptions<Q> & SessionOptions<Q>;
export interface SessionHistory<Q> {
    locations: Array<SessionLocation<Q>>;
    index: number;
    reset(options?: SessionOptions<Q>): void;
}
export declare type InMemoryHistory<Q> = History<Q> & SessionHistory<Q>;
