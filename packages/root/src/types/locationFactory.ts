import { Location, SessionLocation, PartialLocation } from "./location";

export interface QueryFunctions<Q> {
  parse: (query?: string) => Q;
  stringify: (query?: Q) => string;
}

export interface LocationFactoryOptions<Q> {
  query?: QueryFunctions<Q>;
  decode?: boolean;
  baseSegment?: string;
  raw?: (pathname: string) => string;
}

export interface LocationMethods<Q> {
  keyed(location: Location<Q>, key: string): SessionLocation<Q>;
  genericLocation(value: string | object, state?: any): Location<Q>;
  stringifyLocation(location: SessionLocation<Q>): string;
  stringifyLocation(location: PartialLocation<Q>): string;
}
