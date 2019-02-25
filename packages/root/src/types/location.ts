export interface LocationComponents {
  pathname: string;
  query: any;
  hash: string;
  state?: any;
}

export type PartialLocation = Partial<LocationComponents>;

export interface Location extends LocationComponents {
  rawPathname: string;
}

// use SessionLocation instead of Location to prevent
// errors from colliding with window.Location interface
export interface SessionLocation extends Location {
  key: string;
}

export type AnyLocation = SessionLocation | PartialLocation;
