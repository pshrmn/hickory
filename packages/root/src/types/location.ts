export interface LocationComponents<Q> {
  pathname: string;
  query: Q;
  hash: string;
  state?: any;
}

export type PartialLocation<Q> = Partial<LocationComponents<Q>>;

export interface Location<Q> extends LocationComponents<Q> {
  rawPathname: string;
  url: string;
}

// use SessionLocation instead of Location to prevent
// errors from colliding with window.Location interface
export interface SessionLocation<Q> extends Location<Q> {
  key: string;
}

export type AnyLocation<Q> = SessionLocation<Q> | PartialLocation<Q>;
