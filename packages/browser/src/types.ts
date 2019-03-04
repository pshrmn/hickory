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

export type Options = LocationUtilOptions;
export type BrowserHistory = History;
export type PendingBrowserHistory = PendingHistory<BrowserHistory>;
