import { LocationUtils } from "./locationUtils";
import { KeyFns } from "./keyGenerator";
import { SessionLocation, URLWithState } from "./location";
export declare type Action = "push" | "replace" | "pop";
export declare type NavType = "anchor" | "push" | "replace";
export declare type FinishNavigation = () => void;
export declare type CancelNavigation = (nextAction?: Action) => void;
export interface PendingNavigation {
    location: SessionLocation;
    action: Action;
    finish: FinishNavigation;
    cancel: CancelNavigation;
    cancelled?: boolean;
}
export declare type ResponseHandler = (resp: PendingNavigation) => void;
export declare type Preparer = (to: URLWithState, navType: NavType) => PendingNavigation;
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
    createNavigation(location: SessionLocation, action: Action, finish: FinishNavigation, cancel: CancelNavigation): PendingNavigation;
    cancelPending: CancelNavigation;
}
