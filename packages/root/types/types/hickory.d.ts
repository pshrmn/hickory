import { SessionLocation, AnyLocation } from "./location";
import { ResponseHandler, ToArgument, NavType } from "./navigate";
import { LocationUtilOptions } from "./location_utils";
export declare type HistoryOptions = LocationUtilOptions;
export declare type HistoryConstructor<O> = (fn: ResponseHandler, options: O) => History;
export interface History {
    location: SessionLocation;
    to_href(to: AnyLocation): string;
    current(): void;
    cancel(): void;
    destroy(): void;
    navigate(to: ToArgument, nav_type?: NavType): void;
    go(num?: number): void;
}
