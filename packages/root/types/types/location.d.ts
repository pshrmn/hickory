export interface LocationComponents {
    pathname: string;
    query: any;
    hash: string;
    state?: any;
}
export declare type PartialLocation = Partial<LocationComponents>;
export interface Location extends LocationComponents {
    rawPathname: string;
}
export declare type Key = [number, number];
export interface SessionLocation extends Location {
    key: Key;
}
export declare type AnyLocation = SessionLocation | PartialLocation;
