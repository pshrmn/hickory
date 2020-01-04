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

export type BrowserHistoryOptions = HistoryOptions;
export type BrowserHistory = History;
export interface BlockingBrowserHistory extends BrowserHistory {
  confirmWith(fn?: ConfirmationFunction): void;
  removeConfirmation(): void;
}
