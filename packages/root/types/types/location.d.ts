export interface LocationDetails {
    pathname: string;
    query: any;
    hash: string;
    state?: any;
}
export declare type PartialLocation = Partial<LocationDetails>;
export interface HickoryLocation extends LocationDetails {
    key: string | undefined;
    rawPathname: string;
    url: string;
}
export declare type AnyLocation = HickoryLocation | PartialLocation;
