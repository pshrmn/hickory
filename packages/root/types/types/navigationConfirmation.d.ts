import { HickoryLocation } from "./location";
import { Action } from "./hickory";
export interface NavigationInfo<Q> {
    to: HickoryLocation<Q>;
    from: HickoryLocation<Q>;
    action: Action;
}
export declare type ConfirmationFunction<Q> = (info: NavigationInfo<Q>, confirm: () => void, prevent?: () => void) => void;
export interface ConfirmationMethods<Q> {
    confirmNavigation(info: NavigationInfo<Q>, confirm: () => void, prevent?: () => void): void;
    confirmWith(fn?: ConfirmationFunction<Q>): void;
    removeConfirmation(): void;
}
