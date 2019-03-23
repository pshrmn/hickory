import {
  LocationComponents,
  SessionLocation,
  PartialLocation,
  Key
} from "./location";

export interface QueryFunctions {
  parse: (query?: string) => any;
  stringify: (query?: any) => string;
}

export type ModifyPathname = (pathname: string) => string;

export interface LocationUtilOptions {
  query?: QueryFunctions;
  base_segment?: string;
  pathname?: ModifyPathname;
}

export interface LocationUtils {
  keyed(location: LocationComponents, key: Key): SessionLocation;
  generic_location(value: string | object, state?: any): LocationComponents;
  stringify_location(location: SessionLocation): string;
  stringify_location(location: PartialLocation): string;
}
