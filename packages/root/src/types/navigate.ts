import { LocationUtils } from "./locationUtils";
import { KeyFns } from "./keyGenerator";
import { PartialLocation, SessionLocation } from "./location";

export type ToArgument = string | PartialLocation;

export type Action = "push" | "replace" | "pop";
export type NavType = "anchor" | "push" | "replace";
export type FinishNavigation = () => void;
export type CancelNavigation = (nextAction?: Action) => void;
export interface PendingNavigation {
  location: SessionLocation;
  action: Action;
  finish: FinishNavigation;
  cancel: CancelNavigation;
  cancelled?: boolean;
}

export type ResponseHandler = (resp: PendingNavigation) => void;

export type Preparer = (to: ToArgument, navType: NavType) => PendingNavigation;

export interface FinishCancel {
  finish(l: SessionLocation): FinishNavigation;
  cancel: CancelNavigation;
}

export interface NavigateArgs {
  responseHandler: ResponseHandler;
  utils: LocationUtils;
  keygen: KeyFns;
  current(): SessionLocation;
  push: FinishCancel;
  replace: FinishCancel;
}

export interface NavigateHelpers {
  prepare: Preparer;
  emitNavigation(nav: PendingNavigation): void;
  createNavigation(
    location: SessionLocation,
    action: Action,
    finish: FinishNavigation,
    cancel: CancelNavigation
  ): PendingNavigation;
  cancelPending: CancelNavigation;
}
