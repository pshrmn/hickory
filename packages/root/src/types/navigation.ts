import { PartialLocation, SessionLocation } from "./location";

export type ToArgument = string | PartialLocation;

export type Action = "push" | "replace" | "pop";
export type NavType = "anchor" | "push" | "replace";

export interface PendingNavigation {
  location: SessionLocation;
  action: Action;
  finish(): void;
  cancel(nextAction?: Action): void;
  cancelled?: boolean;
}

export type ResponseHandler = (resp: PendingNavigation) => void;
