import {
  PendingHistory,
  History,
  LocationComponents,
  SessionLocation,
  PartialLocation,
  RawLocation,
  AnyLocation,
  LocationUtilOptions
} from "@hickory/root";

export {
  PendingHistory,
  History,
  SessionLocation,
  PartialLocation,
  AnyLocation,
  RawLocation,
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
export type PendingInMemoryHistory = PendingHistory<InMemoryHistory>;
