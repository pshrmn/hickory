import { PartialLocation, SessionLocation } from "./location";

export type ToArgument = string | PartialLocation;

export type Action = "push" | "replace" | "pop";
export type NavType = "anchor" | "push" | "replace";
export type CancelNavigation = (nextAction?: Action) => void;
export interface PendingNavigation {
  location: SessionLocation;
  action: Action;
  finish(): void;
  cancel: CancelNavigation;
  cancelled?: boolean;
}

export type ResponseHandler = (resp: PendingNavigation) => void;
