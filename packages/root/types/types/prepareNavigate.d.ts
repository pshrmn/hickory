import { Action, ToArgument, NavType } from "./navigation";
import { SessionLocation } from "./location";
import { LocationUtils } from "./locationUtils";
import { KeyFns } from "./keyGenerator";
export interface PreppedNavigation {
    action: Action;
    finish(): void;
    location: SessionLocation;
}
export declare type Preparer = (to: ToArgument, navType: NavType) => PreppedNavigation;
export interface PrepNavigateArgs {
    locationUtils: LocationUtils;
    keygen: KeyFns;
    current(): SessionLocation;
    push(l: SessionLocation): () => void;
    replace(l: SessionLocation): () => void;
}
