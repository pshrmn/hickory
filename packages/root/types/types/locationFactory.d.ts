import { HickoryLocation, PartialLocation } from "./location";
export interface QueryFunctions<Q> {
    parse: (query?: string) => Q;
    stringify: (query?: Q) => string;
}
export interface LocationFactoryOptions<Q> {
    query?: QueryFunctions<Q>;
    decode?: boolean;
    baseSegment?: string;
    raw?: (pathname: string) => string;
}
export interface LocationMethods<Q> {
    createLocation(value: string | object, key?: string, state?: any): HickoryLocation<Q>;
    createPath(location: HickoryLocation<Q>): string;
    createPath(location: PartialLocation<Q>): string;
}
