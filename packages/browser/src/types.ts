import {
  PendingHistory,
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

export type Options = LocationUtilOptions;
export type BrowserHistory = History;
export type PendingBrowserHistory = PendingHistory<BrowserHistory>;
