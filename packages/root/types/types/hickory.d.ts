import { SessionLocation, AnyLocation } from "./location";
import { ResponseHandler, ToArgument, NavType, PendingNavigation } from "./navigate";
export declare type PendingHistory<H extends History> = (fn: ResponseHandler) => H;
export interface History {
    location: SessionLocation;
    toHref(to: AnyLocation): string;
    current(): PendingNavigation;
    cancel(): void;
    destroy(): void;
    navigate(to: ToArgument, navType?: NavType): void;
    go(num?: number): void;
}
