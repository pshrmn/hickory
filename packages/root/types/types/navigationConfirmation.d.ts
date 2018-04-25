import { HickoryLocation } from "./location";
import { Action } from "./hickory";
export interface NavigationInfo {
    to: HickoryLocation;
    from: HickoryLocation;
    action: Action;
}
export declare type ConfirmationFunction = (info: NavigationInfo, confirm: () => void, prevent?: () => void) => void;
export interface ConfirmationMethods {
    confirmNavigation(info: NavigationInfo, confirm: () => void, prevent?: () => void): void;
    confirmWith(fn?: ConfirmationFunction): void;
    removeConfirmation(): void;
}
