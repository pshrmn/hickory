import { History, BlockingHistory, LocationComponents, SessionLocation, PartialLocation, AnyLocation, Location, LocationUtilOptions } from "@hickory/root";
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
export declare type InMemoryHistory<Q> = History<Q> & BlockingHistory<Q> & SessionHistory<Q>;
declare function InMemory<Q = string>(options?: Options<Q>): InMemoryHistory<Q>;
export { InMemory };
