export interface LocationComponents {
    pathname: string;
    query: any;
    hash: string;
    state?: any;
}
export declare type PartialLocation = Partial<LocationComponents>;
export interface RawLocation extends LocationComponents {
    rawPathname: string;
}
export declare type Key = [number, number];
export interface SessionLocation extends RawLocation {
    key: Key;
}
export declare type AnyLocation = SessionLocation | PartialLocation;
