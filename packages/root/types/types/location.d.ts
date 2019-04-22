export interface LocationComponents {
    pathname: string;
    query: any;
    hash: string;
    state?: any;
}
export interface URLWithState {
    url: string;
    state?: any;
}
export declare type PartialLocation = Partial<LocationComponents>;
export declare type Key = [number, number];
export interface SessionLocation extends LocationComponents {
    key: Key;
}
export declare type Hrefable = PartialLocation | string;
