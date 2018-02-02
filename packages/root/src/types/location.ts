export interface LocationDetails {
  query?: any;
  hash?: string;
  state?: any;
}

export interface PartialLocation extends LocationDetails {
  pathname?: string;
  rawPathname?: string;
}

// use HickoryLocation instead of Location to prevent
// errors from colling with window.Location interface
export interface HickoryLocation {
  pathname: string;
  query: any;
  hash: string;
  state?: any;
  key: string;
  rawPathname: string;
}

export type AnyLocation = HickoryLocation | PartialLocation;
