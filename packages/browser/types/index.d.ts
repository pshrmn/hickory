import { History, BlockingHistory, LocationComponents, PartialLocation, SessionLocation, AnyLocation, Location, LocationUtilOptions } from "@hickory/root";
export { History, SessionLocation, PartialLocation, AnyLocation, Location, LocationComponents };
export declare type Options<Q> = LocationUtilOptions<Q>;
export declare type BrowserHistory<Q> = History<Q> & BlockingHistory<Q>;
declare function Browser<Q = string>(options?: Options<Q>): History<Q>;
export { Browser };
