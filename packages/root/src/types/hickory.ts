import { SessionLocation, Hrefable } from "./location";
import { ResponseHandler, ToArgument, NavType } from "./navigate";
import { LocationUtilOptions } from "./location_utils";

export type HistoryOptions = LocationUtilOptions;
export type HistoryConstructor<O> = (
  fn: ResponseHandler,
  options: O
) => History;

export interface History {
  location: SessionLocation;
  href(to: Hrefable): string;
  current(): void;
  cancel(): void;
  destroy(): void;
  navigate(to: ToArgument, nav_type?: NavType): void;
  go(num?: number): void;
}
