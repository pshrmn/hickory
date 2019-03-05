import { SessionLocation } from "./location";
import { Action } from "./navigate";

export interface NavigationInfo {
  to: SessionLocation;
  from: SessionLocation;
  action: Action;
}

export type ConfirmationFunction = (
  info: NavigationInfo,
  confirm: () => void,
  prevent?: () => void
) => void;

export interface ConfirmationMethods {
  confirmNavigation(
    info: NavigationInfo,
    confirm: () => void,
    prevent?: () => void
  ): void;
  confirmWith(fn?: ConfirmationFunction): void;
  removeConfirmation(): void;
}

export interface BlockingHistory {
  confirmWith(fn?: ConfirmationFunction): void;
  removeConfirmation(): void;
}
