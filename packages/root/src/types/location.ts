export interface LocationDetails<Q> {
  pathname: string;
  query: Q;
  hash: string;
  state?: any;
}

export type PartialLocation<Q> = Partial<LocationDetails<Q>>;

// use HickoryLocation instead of Location to prevent
// errors from colliding with window.Location interface
export interface HickoryLocation<Q> extends LocationDetails<Q> {
  key: string | undefined;
  rawPathname: string;
  url: string;
}

export type AnyLocation<Q> = HickoryLocation<Q> | PartialLocation<Q>;
