import {
  HistoryConstructor,
  HistoryOptions,
  History,
  URLWithState,
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
  URLWithState,
  Hrefable,
  LocationComponents
};

export type InputLocations = Array<URLWithState>;

export interface SessionOptions {
  locations?: InputLocations;
  index?: number;
}

export type InMemoryOptions = HistoryOptions & SessionOptions;
interface ResettingHistory {
  reset(options?: SessionOptions): void;
}

export type InMemoryHistory = History & ResettingHistory;

export interface LocationOptions {
  location: URLWithState;
}
