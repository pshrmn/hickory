export interface LocationComponents {
  pathname: string;
  query: any;
  hash: string;
  state?: any;
}

export type PartialLocation = Partial<LocationComponents>;

export interface RawLocation extends LocationComponents {
  rawPathname: string;
}

export type Key = [number, number];

export interface SessionLocation extends RawLocation {
  key: Key;
}

export type AnyLocation = SessionLocation | PartialLocation;
