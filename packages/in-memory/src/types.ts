import {
  HistoryConstructor,
  HistoryOptions,
  History,
  LocationComponents,
  SessionLocation,
  PartialLocation,
  RawLocation,
  AnyLocation
} from "@hickory/root";

export {
  HistoryConstructor,
  HistoryOptions,
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

export type InMemoryOptions = HistoryOptions & SessionOptions;
export interface InMemoryHistory extends History {
  reset(options?: SessionOptions): void;
}
