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

export interface HashTypeOptions {
  hashType?: string;
}
export type HashOptions = HistoryOptions & HashTypeOptions;
export type HashHistory = History;
