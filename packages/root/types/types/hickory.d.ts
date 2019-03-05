import { SessionLocation, AnyLocation } from "./location";
import { ResponseHandler, ToArgument, NavType } from "./navigate";
import { LocationUtilOptions } from "./locationUtils";
export declare type HistoryOptions = LocationUtilOptions;
export declare type HistoryConstructor = (fn: ResponseHandler, o?: HistoryOptions) => History;
export interface History {
    location: SessionLocation;
    toHref(to: AnyLocation): string;
    current(): void;
    cancel(): void;
    destroy(): void;
    navigate(to: ToArgument, navType?: NavType): void;
    go(num?: number): void;
}
