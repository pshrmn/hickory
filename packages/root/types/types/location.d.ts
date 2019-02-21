export interface LocationDetails<Q> {
    pathname: string;
    query: Q;
    hash: string;
    state?: any;
}
export declare type PartialLocation<Q> = Partial<LocationDetails<Q>>;
export interface HickoryLocation<Q> extends LocationDetails<Q> {
    key: string | undefined;
    rawPathname: string;
    url: string;
}
export declare type AnyLocation<Q> = HickoryLocation<Q> | PartialLocation<Q>;
