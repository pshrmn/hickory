import {
  ConfirmationFunction,
  ConfirmationMethods,
  NavigationInfo
} from "./types/navigationConfirmation";

function noop(): void {}

export default function createNavigationConfirmation<Q>(): ConfirmationMethods<
  Q
> {
  let confirmFunction: ConfirmationFunction<Q> | null;

  return {
    confirmNavigation(
      info: NavigationInfo<Q>,
      confirm: () => void,
      prevent?: () => void
    ): void {
      if (!confirmFunction) {
        confirm();
      } else {
        confirmFunction(info, confirm, prevent || noop);
      }
    },

    confirmWith(fn: ConfirmationFunction<Q>): void {
      if (typeof fn !== "function") {
        throw new Error("confirmWith can only be passed a function");
      }
      confirmFunction = fn;
    },

    removeConfirmation(): void {
      confirmFunction = null;
    }
  };
}
