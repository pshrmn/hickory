export interface LocationDetails<Q> {
    pathname: string;
    query: Q;
    hash: string;
    state?: any;
}
export declare type PartialLocation<Q> = Partial<LocationDetails<Q>>;
export interface KeylessLocation<Q> extends LocationDetails<Q> {
    rawPathname: string;
    url: string;
}
export interface HickoryLocation<Q> extends KeylessLocation<Q> {
    key: string;
}
export declare type AnyLocation<Q> = HickoryLocation<Q> | PartialLocation<Q>;
