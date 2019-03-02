import { Location, SessionLocation, PartialLocation } from "./location";

export interface QueryFunctions {
  parse: (query?: string) => any;
  stringify: (query?: any) => string;
}

export type RawPathname = (pathname: string) => string;

export interface LocationUtilOptions {
  query?: QueryFunctions;
  decode?: boolean;
  baseSegment?: string;
  raw?: RawPathname;
}

export interface LocationUtils {
  keyed(location: Location, key: string): SessionLocation;
  genericLocation(value: string | object, state?: any): Location;
  stringifyLocation(location: SessionLocation): string;
  stringifyLocation(location: PartialLocation): string;
}
