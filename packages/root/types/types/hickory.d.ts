import { SessionLocation, AnyLocation } from "./location";
import { Action, ResponseHandler, ToArgument, NavType } from "./navigation";
export interface History<Q> {
    location: SessionLocation<Q>;
    action: Action;
    toHref(to: AnyLocation<Q>): string;
    respondWith(fn: ResponseHandler<Q>): void;
    destroy(): void;
    navigate(to: ToArgument<Q>, navType?: NavType): void;
    go(num?: number): void;
}
