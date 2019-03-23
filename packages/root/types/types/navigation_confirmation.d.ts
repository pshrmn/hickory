import { SessionLocation } from "./location";
import { Action } from "./navigate";
export interface NavigationInfo {
    to: SessionLocation;
    from: SessionLocation;
    action: Action;
}
export declare type ConfirmationFunction = (info: NavigationInfo, confirm: () => void, prevent?: () => void) => void;
export interface ConfirmationMethods {
    confirm_navigation(info: NavigationInfo, confirm: () => void, prevent?: () => void): void;
    confirm_with(fn?: ConfirmationFunction): void;
    remove_confirmation(): void;
}
export interface BlockingHistory {
    confirm_with(fn?: ConfirmationFunction): void;
    remove_confirmation(): void;
}
