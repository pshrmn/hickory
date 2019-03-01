import { SessionLocation, AnyLocation } from "./location";
import { ResponseHandler, ToArgument, NavType } from "./navigation";

export interface History {
  location: SessionLocation;
  toHref(to: AnyLocation): string;
  respondWith(fn: ResponseHandler): void;
  destroy(): void;
  navigate(to: ToArgument, navType?: NavType): void;
  go(num?: number): void;
}
