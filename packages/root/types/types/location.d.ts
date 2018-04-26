export interface LocationDetails {
    query?: any;
    hash?: string;
    state?: any;
}
export interface PartialLocation extends LocationDetails {
    pathname?: string;
    rawPathname?: string;
}
export interface HickoryLocation {
    pathname: string;
    query: any;
    hash: string;
    state?: any;
    key: string | undefined;
    rawPathname: string;
}
export declare type AnyLocation = HickoryLocation | PartialLocation;
