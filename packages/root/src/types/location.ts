export interface LocationDetails {
  pathname: string;
  query: any;
  hash: string;
  state?: any;
}

export type PartialLocation = Partial<LocationDetails>;

// use HickoryLocation instead of Location to prevent
// errors from colliding with window.Location interface
export interface HickoryLocation extends LocationDetails {
  key: string | undefined;
  rawPathname: string;
  url: string;
}

export type AnyLocation = HickoryLocation | PartialLocation;
