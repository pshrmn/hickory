import {
  ConfirmationFunction,
  ConfirmationMethods,
  NavigationInfo
} from "./types/navigationConfirmation";

function noop(): void {}

export default function createNavigationConfirmation(): ConfirmationMethods {
  let confirmFn: ConfirmationFunction | null;

  return {
    confirmNavigation(
      info: NavigationInfo,
      confirm: () => void,
      prevent?: () => void
    ): void {
      if (!confirmFn) {
        confirm();
      } else {
        confirmFn(info, confirm, prevent || noop);
      }
    },

    confirmWith(fn: ConfirmationFunction): void {
      confirmFn = fn;
    },

    removeConfirmation(): void {
      confirmFn = null;
    }
  };
}
