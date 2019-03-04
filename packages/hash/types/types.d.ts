import { PendingHistory, History, LocationComponents, SessionLocation, PartialLocation, Location, AnyLocation, LocationUtilOptions } from "@hickory/root";
export { PendingHistory, History, SessionLocation, PartialLocation, AnyLocation, Location, LocationComponents };
export interface HashOptions {
    hashType?: string;
}
export declare type Options = LocationUtilOptions & HashOptions;
export declare type HashHistory = History;
export declare type PendingHashHistory = PendingHistory<HashHistory>;
