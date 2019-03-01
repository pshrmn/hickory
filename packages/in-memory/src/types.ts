import {
  History,
  LocationComponents,
  PartialLocation,
  SessionLocation,
  AnyLocation,
  Location,
  LocationUtilOptions
} from "@hickory/root";

export {
  History,
  SessionLocation,
  PartialLocation,
  AnyLocation,
  Location,
  LocationComponents
};

export type InputLocation = string | PartialLocation;
export type InputLocations = Array<InputLocation>;

export interface SessionOptions {
  locations?: InputLocations;
  index?: number;
}

export type Options = LocationUtilOptions & SessionOptions;

export interface SessionHistory {
  reset(options?: SessionOptions): void;
}

export type InMemoryHistory = History & SessionHistory;
