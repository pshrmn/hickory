import { LocationComponents, SessionLocation, Hrefable, Key, URLWithState } from "./location";
import { BaseFunctions } from "./base";
export interface QueryFunctions {
    parse(query?: string): any;
    stringify(query?: any): string;
}
export interface LocationUtilOptions {
    query?: QueryFunctions;
    base?: BaseFunctions;
}
export interface LocationUtils {
    keyed(location: LocationComponents, key: Key): SessionLocation;
    location(value: URLWithState, current?: LocationComponents): LocationComponents;
    stringify(location: Hrefable): string;
}
