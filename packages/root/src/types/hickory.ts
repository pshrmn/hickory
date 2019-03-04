import { SessionLocation, AnyLocation } from "./location";
import { ResponseHandler, ToArgument, NavType } from "./navigate";

export type PendingHistory<H extends History = History> = (
  fn: ResponseHandler
) => H;

export interface History {
  location: SessionLocation;
  toHref(to: AnyLocation): string;
  current(): void;
  cancel(): void;
  destroy(): void;
  navigate(to: ToArgument, navType?: NavType): void;
  go(num?: number): void;
}
