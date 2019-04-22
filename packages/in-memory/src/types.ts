import {
  HistoryConstructor,
  HistoryOptions,
  History,
  ToArgument,
  LocationComponents,
  SessionLocation,
  PartialLocation,
  Hrefable
} from "@hickory/root";

export {
  HistoryConstructor,
  HistoryOptions,
  History,
  SessionLocation,
  PartialLocation,
  ToArgument,
  Hrefable,
  LocationComponents
};

export type InputLocations = Array<ToArgument>;

export interface SessionOptions {
  locations?: InputLocations;
  index?: number;
}

export type InMemoryOptions = HistoryOptions & SessionOptions;
export interface InMemoryHistory extends History {
  reset(options?: SessionOptions): void;
}

export interface LocationOptions {
  location: ToArgument;
}
