export interface LocationComponents<Q> {
    pathname: string;
    query: Q;
    hash: string;
    state?: any;
}
export declare type PartialLocation<Q> = Partial<LocationComponents<Q>>;
export interface Location<Q> extends LocationComponents<Q> {
    rawPathname: string;
    url: string;
}
export interface SessionLocation<Q> extends Location<Q> {
    key: string;
}
export declare type AnyLocation<Q> = SessionLocation<Q> | PartialLocation<Q>;
