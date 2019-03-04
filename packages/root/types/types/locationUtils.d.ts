import { Location, SessionLocation, PartialLocation, Key } from "./location";
export interface QueryFunctions {
    parse: (query?: string) => any;
    stringify: (query?: any) => string;
}
export declare type RawPathname = (pathname: string) => string;
export interface LocationUtilOptions {
    query?: QueryFunctions;
    decode?: boolean;
    baseSegment?: string;
    raw?: RawPathname;
}
export interface LocationUtils {
    keyed(location: Location, key: Key): SessionLocation;
    genericLocation(value: string | object, state?: any): Location;
    stringifyLocation(location: SessionLocation): string;
    stringifyLocation(location: PartialLocation): string;
}
