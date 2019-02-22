import { HickoryLocation, AnyLocation, PartialLocation } from "./location";
import { LocationFactoryOptions, LocationMethods } from "./locationFactory";
import { KeyMethods } from "./keygen";
import { ConfirmationFunction, ConfirmationMethods } from "./navigationConfirmation";
export declare type ToArgument<Q> = string | PartialLocation<Q>;
export declare type Action = "push" | "replace" | "pop";
export declare type NavType = "anchor" | "push" | "replace";
export interface PendingNavigation<Q> {
    location: HickoryLocation<Q>;
    action: Action;
    finish(): void;
    cancel(nextAction?: Action): void;
    cancelled?: boolean;
}
export declare type ResponseHandler<Q> = (resp: PendingNavigation<Q>) => void;
export interface History<Q> {
    location: HickoryLocation<Q>;
    action: Action;
    toHref(to: AnyLocation<Q>): string;
    respondWith(fn: ResponseHandler<Q>): void;
    confirmWith(fn?: ConfirmationFunction<Q>): void;
    removeConfirmation(): void;
    destroy(): void;
    navigate(to: ToArgument<Q>, navType?: NavType): void;
    go(num?: number): void;
}
export declare type Options<Q> = LocationFactoryOptions<Q>;
export declare type CommonHistory<Q> = LocationMethods<Q> & ConfirmationMethods<Q> & KeyMethods;
