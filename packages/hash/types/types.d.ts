import { PendingHistory, History, LocationComponents, SessionLocation, PartialLocation, RawLocation, AnyLocation, LocationUtilOptions } from "@hickory/root";
export { PendingHistory, History, SessionLocation, PartialLocation, AnyLocation, RawLocation, LocationComponents };
export interface HashOptions {
    hashType?: string;
}
export declare type Options = LocationUtilOptions & HashOptions;
export declare type HashHistory = History;
export declare type PendingHashHistory = PendingHistory<HashHistory>;
