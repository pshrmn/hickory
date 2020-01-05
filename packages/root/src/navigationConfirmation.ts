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
      allow: () => void,
      prevent?: () => void
    ): void {
      if (!confirmFn) {
        allow();
      } else {
        confirmFn(info, allow, prevent || noop);
      }
    },

    confirm(fn?: ConfirmationFunction): void {
      confirmFn = fn ? fn : null;
    }
  };
}
