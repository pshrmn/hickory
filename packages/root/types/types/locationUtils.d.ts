import { LocationComponents, SessionLocation, Hrefable, Key } from "./location";
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
    location(value: string | object, state?: any): LocationComponents;
    stringify(location: Hrefable): string;
}
