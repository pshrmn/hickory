import { PartialLocation, SessionLocation } from "./location";
export declare type ToArgument = string | PartialLocation;
export declare type Action = "push" | "replace" | "pop";
export declare type NavType = "anchor" | "push" | "replace";
export declare type CancelNavigation = (nextAction: Action | undefined) => void;
export interface PendingNavigation {
    location: SessionLocation;
    action: Action;
    finish(): void;
    cancel: CancelNavigation;
    cancelled?: boolean;
}
export declare type ResponseHandler = (resp: PendingNavigation) => void;
