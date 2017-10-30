import { HickoryLocation } from './interface';
export interface NavigationInfo {
    to: HickoryLocation;
    from: HickoryLocation;
    action: string;
}
export declare type ConfirmationFunction = (info: NavigationInfo, confirm: () => void, prevent?: () => void) => void;
export interface ConfirmationMethods {
    confirmNavigation(info: NavigationInfo, confirm: () => void, prevent?: () => void): void;
    confirmWith(fn?: ConfirmationFunction): void;
    removeConfirmation(): void;
}
export default function createNavigationConfirmation(): ConfirmationMethods;
