import { HickoryLocation, PartialLocation } from './location';
export interface QueryFunctions {
    parse: (query?: string) => any;
    stringify: (query?: any) => string;
}
export interface LocationFactoryOptions {
    query?: QueryFunctions;
    decode?: boolean;
    baseSegment?: string;
    raw?: (pathname: string) => string;
}
export interface LocationMethods {
    createLocation(value: string | object, key?: string, state?: any): HickoryLocation;
    createPath(location: HickoryLocation): string;
    createPath(location: PartialLocation): string;
}
