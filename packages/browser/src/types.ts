import {
  HistoryConstructor,
  HistoryOptions,
  History,
  LocationComponents,
  SessionLocation,
  PartialLocation,
  AnyLocation,
  ConfirmationFunction
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

export type BrowserHistoryOptions = HistoryOptions;
export type BrowserHistory = History;
export interface BlockingBrowserHistory extends BrowserHistory {
  confirm_with(fn?: ConfirmationFunction): void;
  remove_confirmation(): void;
}
