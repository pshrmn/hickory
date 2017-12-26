export interface PartialLocation {
  pathname?: string;
  rawPathname?: string;
  query?: any;
  hash?: string
  state?: any;
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

