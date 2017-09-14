import { HickoryLocation } from './interface';

export interface NavigationInfo {
  to: HickoryLocation;
  from: HickoryLocation;
  action: string;
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

function noop(): void {}

export default function createNavigationConfirmation(): ConfirmationMethods {

  let confirmFunction: ConfirmationFunction;

  function confirmNavigation(
    info: NavigationInfo,
    confirm: () => void,
    prevent?: () => void
  ): void {
    if (!confirmFunction) {
      confirm();
    } else {
      confirmFunction(info, confirm, prevent || noop);
    }
  }

  function confirmWith(fn?: ConfirmationFunction ): void {
    if (typeof fn !== 'function') {
      return;
    }
    confirmFunction = fn;
  };

  function removeConfirmation(): void {
    confirmFunction = null;
  };

  return {
    confirmNavigation,
    confirmWith,
    removeConfirmation
  };
}
