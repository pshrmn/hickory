import { HickoryLocation, AnyLocation, PartialLocation } from "./location";
import { LocationFactoryOptions, LocationMethods } from "./locationFactory";
import { KeyMethods } from "./keygen";
import { ConfirmationFunction, ConfirmationMethods } from "./navigationConfirmation";
export declare type ToArgument = string | PartialLocation;
export declare type Action = "PUSH" | "REPLACE" | "POP";
export declare type NavType = "ANCHOR" | "PUSH" | "REPLACE";
export interface PendingNavigation {
    location: HickoryLocation;
    action: Action;
    finish(): void;
    cancel(nextAction?: Action): void;
    cancelled?: boolean;
}
export declare type ResponseHandler = (resp: PendingNavigation) => void;
export interface History {
    location: HickoryLocation;
    action: Action;
    toHref(to: AnyLocation): string;
    respondWith(fn: ResponseHandler): void;
    confirmWith(fn?: ConfirmationFunction): void;
    removeConfirmation(): void;
    destroy(): void;
    navigate(to: ToArgument, navType?: NavType): void;
    go(num?: number): void;
}
export declare type Options = LocationFactoryOptions;
export declare type CommonHistory = LocationMethods & ConfirmationMethods & KeyMethods;
