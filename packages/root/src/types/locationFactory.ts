import { KeylessLocation, HickoryLocation, PartialLocation } from "./location";

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
  keyed(location: KeylessLocation<Q>, key: string): HickoryLocation<Q>;
  genericLocation(value: string | object, state?: any): KeylessLocation<Q>;
  stringifyLocation(location: HickoryLocation<Q>): string;
  stringifyLocation(location: PartialLocation<Q>): string;
}
