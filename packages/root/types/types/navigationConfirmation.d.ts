import { SessionLocation } from "./location";
import { Action } from "./navigate";
export interface NavigationInfo {
    to: SessionLocation;
    from: SessionLocation;
    action: Action;
}
export declare type ConfirmationFunction = (info: NavigationInfo, allow: () => void, prevent?: () => void) => void;
export interface ConfirmationMethods {
    confirmNavigation(info: NavigationInfo, allow: () => void, prevent?: () => void): void;
    confirm(fn?: ConfirmationFunction): void;
}
