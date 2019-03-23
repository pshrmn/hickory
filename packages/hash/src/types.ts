import {
  HistoryConstructor,
  HistoryOptions,
  History,
  LocationComponents,
  SessionLocation,
  PartialLocation,
  AnyLocation
} from "@hickory/root";

export {
  HistoryConstructor,
  HistoryOptions,
  History,
  SessionLocation,
  PartialLocation,
  AnyLocation,
  LocationComponents
};

export interface HashTypeOptions {
  hash_type?: string;
}
export type HashOptions = HistoryOptions & HashTypeOptions;
export type HashHistory = History;
