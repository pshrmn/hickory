export type Pathname = string;
export type Query = any;
export type Hash = string;
export type State = any | null;
export type Key = string;

export interface LocationDetails {
  query?: Query;
  hash?: Hash;
  state?: State;
}

export interface PartialLocation extends LocationDetails {
  pathname?: Pathname;
  rawPathname?: Pathname;
}

// use HickoryLocation instead of Location to prevent
// errors from colling with window.Location interface
export interface HickoryLocation {
  pathname: Pathname;
  query: Query;
  hash: Hash;
  state?: State;
  key: Key;
  rawPathname: Pathname;
}

export type AnyLocation = HickoryLocation | PartialLocation;
