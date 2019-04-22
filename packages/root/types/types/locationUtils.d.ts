import { LocationComponents, SessionLocation, Hrefable, Key, PartialLocation, URLWithState } from "./location";
export interface QueryFunctions {
    parse: (query?: string) => any;
    stringify: (query?: any) => string;
}
export interface LocationUtilOptions {
    query?: QueryFunctions;
    base?: string;
}
export interface LocationUtils {
    keyed(location: LocationComponents, key: Key): SessionLocation;
    location(value: PartialLocation | URLWithState): LocationComponents;
    stringify(location: Hrefable): string;
}
