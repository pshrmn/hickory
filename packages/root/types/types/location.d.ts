export interface PartialLocation {
    pathname?: string;
    rawPathname?: string;
    query?: any;
    hash?: string;
    state?: any;
}
export interface HickoryLocation {
    pathname: string;
    query: any;
    hash: string;
    state?: any;
    key: string;
    rawPathname: string;
}
export declare type AnyLocation = HickoryLocation | PartialLocation;
