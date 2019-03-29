export interface LocationComponents {
  pathname: string;
  query: any;
  hash: string;
  state?: any;
}

export type PartialLocation = Partial<LocationComponents>;

export type Key = [number, number];

export interface SessionLocation extends LocationComponents {
  key: Key;
}

export type Hrefable = PartialLocation | string;
