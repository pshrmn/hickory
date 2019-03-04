import {
  PendingHistory,
  History,
  LocationComponents,
  SessionLocation,
  PartialLocation,
  Location,
  AnyLocation,
  LocationUtilOptions
} from "@hickory/root";

export {
  PendingHistory,
  History,
  SessionLocation,
  PartialLocation,
  AnyLocation,
  Location,
  LocationComponents
};

export type Options = LocationUtilOptions;
export type BrowserHistory = History;
export type PendingBrowserHistory = PendingHistory<BrowserHistory>;
