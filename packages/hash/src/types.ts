import {
  HistoryConstructor,
  HistoryOptions,
  History,
  LocationComponents,
  SessionLocation,
  PartialLocation,
  Hrefable,
  ConfirmationFunction
} from "@hickory/root";

export {
  HistoryConstructor,
  HistoryOptions,
  History,
  SessionLocation,
  PartialLocation,
  Hrefable,
  LocationComponents
};

export interface HashTypeOptions {
  hashType?: string;
}
export type HashOptions = HistoryOptions & HashTypeOptions;
export type HashHistory = History;
export interface BlockingHashHistory extends HashHistory {
  confirmWith(fn?: ConfirmationFunction): void;
  removeConfirmation(): void;
}
