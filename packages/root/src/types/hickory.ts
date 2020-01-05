import { SessionLocation, URLWithState, Hrefable } from "./location";
import { ResponseHandler, NavType } from "./navigate";
import { LocationUtilOptions } from "./locationUtils";
import { ConfirmationFunction } from "./navigationConfirmation";

export type HistoryOptions = LocationUtilOptions;
export type HistoryConstructor<O> = (
  fn: ResponseHandler,
  options: O
) => History;

export interface History {
  location: SessionLocation;
  url(to: Hrefable): string;
  navigate(to: URLWithState, navType?: NavType): void;
  go(num?: number): void;
  current(): void;
  cancel(): void;
  confirm(fn?: ConfirmationFunction): void;
  destroy(): void;
}
