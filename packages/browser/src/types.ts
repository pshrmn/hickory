import {
  HistoryConstructor,
  HistoryOptions,
  History,
  LocationComponents,
  SessionLocation,
  PartialLocation,
  Hrefable,
  BlockingHistory
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
export type BlockingBrowserHistory = BrowserHistory & BlockingHistory;
