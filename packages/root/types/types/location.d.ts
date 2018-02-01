export declare type Pathname = string;
export declare type Query = any;
export declare type Hash = string;
export declare type State = any | null;
export declare type Key = string;
export interface LocationDetails {
  query?: Query;
  hash?: Hash;
  state?: State;
}
export interface PartialLocation extends LocationDetails {
  pathname?: Pathname;
  rawPathname?: Pathname;
}
export interface HickoryLocation {
  pathname: Pathname;
  query: Query;
  hash: Hash;
  state?: State;
  key: Key;
  rawPathname: Pathname;
}
export declare type AnyLocation = HickoryLocation | PartialLocation;
