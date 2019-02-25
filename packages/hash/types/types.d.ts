import { History, LocationComponents, SessionLocation, PartialLocation, Location, AnyLocation, LocationUtilOptions } from "@hickory/root";
export { History, SessionLocation, PartialLocation, AnyLocation, Location, LocationComponents };
export interface HashOptions {
    hashType?: string;
}
export declare type Options = LocationUtilOptions & HashOptions;
export declare type HashHistory = History;
