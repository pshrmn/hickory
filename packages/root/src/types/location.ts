export interface LocationDetails<Q> {
  pathname: string;
  query: Q;
  hash: string;
  state?: any;
}

export type PartialLocation<Q> = Partial<LocationDetails<Q>>;

export interface KeylessLocation<Q> extends LocationDetails<Q> {
  rawPathname: string;
  url: string;
}

// use HickoryLocation instead of Location to prevent
// errors from colliding with window.Location interface
export interface HickoryLocation<Q> extends KeylessLocation<Q> {
  key: string;
}

export type AnyLocation<Q> = HickoryLocation<Q> | PartialLocation<Q>;
