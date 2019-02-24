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

export type Options<Q> = LocationUtilOptions<Q>;
export type BrowserHistory<Q> = History<Q>;
