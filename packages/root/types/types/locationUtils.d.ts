import { LocationComponents, SessionLocation, PartialLocation, Key } from "./location";
export interface QueryFunctions {
    parse: (query?: string) => any;
    stringify: (query?: any) => string;
}
export declare type RawPathname = (pathname: string) => string;
export interface LocationUtilOptions {
    query?: QueryFunctions;
    baseSegment?: string;
    raw?: RawPathname;
}
export interface LocationUtils {
    keyed(location: LocationComponents, key: Key): SessionLocation;
    genericLocation(value: string | object, state?: any): LocationComponents;
    stringifyLocation(location: SessionLocation): string;
    stringifyLocation(location: PartialLocation): string;
}
