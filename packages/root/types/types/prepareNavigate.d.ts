import { Action, ToArgument, NavType } from "./navigation";
import { SessionLocation } from "./location";
import { LocationUtils } from "./locationUtils";
import { KeyFns } from "./keyGenerator";
export interface PreppedNavigation<Q> {
    action: Action;
    finish(): void;
    location: SessionLocation<Q>;
}
export declare type Preparer<Q> = (to: ToArgument<Q>, navType: NavType) => PreppedNavigation<Q>;
export interface PrepNavigateArgs<Q> {
    locationUtils: LocationUtils<Q>;
    keygen: KeyFns;
    current(): SessionLocation<Q>;
    push(l: SessionLocation<Q>): () => void;
    replace(l: SessionLocation<Q>): () => void;
}
