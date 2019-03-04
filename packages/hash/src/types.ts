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

export interface HashOptions {
  hashType?: string;
}
export type Options = LocationUtilOptions & HashOptions;
export type HashHistory = History;
export type PendingHashHistory = PendingHistory<HashHistory>;
