import { SessionLocation, URLWithState, Hrefable } from "./location";
import { ResponseHandler, NavType } from "./navigate";
import { LocationUtilOptions } from "./locationUtils";
export declare type HistoryOptions = LocationUtilOptions;
export declare type HistoryConstructor<O> = (fn: ResponseHandler, options: O) => History;
export interface History {
    location: SessionLocation;
    url(to: Hrefable): string;
    current(): void;
    cancel(): void;
    destroy(): void;
    navigate(to: URLWithState, navType?: NavType): void;
    go(num?: number): void;
}
