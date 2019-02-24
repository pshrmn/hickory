import { PartialLocation, SessionLocation } from "./location";
export declare type ToArgument<Q> = string | PartialLocation<Q>;
export declare type Action = "push" | "replace" | "pop";
export declare type NavType = "anchor" | "push" | "replace";
export interface PendingNavigation<Q> {
    location: SessionLocation<Q>;
    action: Action;
    finish(): void;
    cancel(nextAction?: Action): void;
    cancelled?: boolean;
}
export declare type ResponseHandler<Q> = (resp: PendingNavigation<Q>) => void;
