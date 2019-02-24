import { Action, ToArgument, NavType } from "./hickory";
import { SessionLocation } from "./location";
import { LocationMethods } from "./locationFactory";
import { KeyMethods } from "./keygen";
export interface PreppedNavigation<Q> {
    action: Action;
    finish(): void;
    location: SessionLocation<Q>;
}
export declare type Preparer<Q> = (to: ToArgument<Q>, navType: NavType) => PreppedNavigation<Q>;
export interface PrepNavigateArgs<Q> {
    utils: LocationMethods<Q> & KeyMethods;
    current(): SessionLocation<Q>;
    push(l: SessionLocation<Q>): () => void;
    replace(l: SessionLocation<Q>): () => void;
}
