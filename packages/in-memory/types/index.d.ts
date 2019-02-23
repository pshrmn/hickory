import { History, LocationComponents, SessionLocation, PartialLocation, AnyLocation, Location, Options as RootOptions } from "@hickory/root";
export { History, SessionLocation, PartialLocation, AnyLocation, Location, LocationComponents };
export declare type InputLocations<Q> = Array<string | PartialLocation<Q>>;
export interface Options<Q> extends RootOptions<Q> {
    locations?: InputLocations<Q>;
    index?: number;
}
export interface ResetOptions<Q> {
    locations?: InputLocations<Q>;
    index?: number;
}
export interface InMemoryHistory<Q> extends History<Q> {
    locations: Array<SessionLocation<Q>>;
    index: number;
    reset(options?: ResetOptions<Q>): void;
}
declare function InMemory<Q = string>(options?: Options<Q>): InMemoryHistory<Q>;
export { InMemory };
