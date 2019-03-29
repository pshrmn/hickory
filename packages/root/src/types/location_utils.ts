import { LocationComponents, SessionLocation, Hrefable, Key } from "./location";

export interface QueryFunctions {
  parse: (query?: string) => any;
  stringify: (query?: any) => string;
}

export type VerifyPathname = (pathname: string) => boolean;

export interface LocationUtilOptions {
  query?: QueryFunctions;
  base_segment?: string;
  pathname?: VerifyPathname;
}

export interface LocationUtils {
  keyed(location: LocationComponents, key: Key): SessionLocation;
  location(value: string | object, state?: any): LocationComponents;
  stringify(location: Hrefable): string;
}
