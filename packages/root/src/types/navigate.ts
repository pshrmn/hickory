import { LocationUtils } from "./location_utils";
import { KeyFns } from "./key_generator";
import { PartialLocation, SessionLocation } from "./location";

export type ToArgument = string | PartialLocation;

export type Action = "push" | "replace" | "pop";
export type NavType = "anchor" | "push" | "replace";
export type FinishNavigation = () => void;
export type CancelNavigation = (next_action?: Action) => void;
export interface PendingNavigation {
  location: SessionLocation;
  action: Action;
  finish: FinishNavigation;
  cancel: CancelNavigation;
  cancelled?: boolean;
}

export type ResponseHandler = (resp: PendingNavigation) => void;

export type Preparer = (to: ToArgument, nav_type: NavType) => PendingNavigation;

export interface FinishCancel {
  finish(l: SessionLocation): FinishNavigation;
  cancel: CancelNavigation;
}

export interface NavigateArgs {
  response_handler: ResponseHandler;
  utils: LocationUtils;
  keygen: KeyFns;
  current(): SessionLocation;
  push: FinishCancel;
  replace: FinishCancel;
}

export interface NavigateHelpers {
  prepare: Preparer;
  emit_navigation(nav: PendingNavigation): void;
  create_navigation(
    location: SessionLocation,
    action: Action,
    finish: FinishNavigation,
    cancel: CancelNavigation
  ): PendingNavigation;
  cancel_pending: CancelNavigation;
}
