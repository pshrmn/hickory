import {
  ConfirmationFunction,
  ConfirmationMethods,
  NavigationInfo
} from "./types/confirmation";

function noop(): void {}

export default function confirmation(): ConfirmationMethods {
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
