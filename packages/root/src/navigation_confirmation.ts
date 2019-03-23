import {
  ConfirmationFunction,
  ConfirmationMethods,
  NavigationInfo
} from "./types/navigation_confirmation";

function noop(): void {}

export default function create_navigation_confirmation(): ConfirmationMethods {
  let confirm_function: ConfirmationFunction | null;

  return {
    confirm_navigation(
      info: NavigationInfo,
      confirm: () => void,
      prevent?: () => void
    ): void {
      if (!confirm_function) {
        confirm();
      } else {
        confirm_function(info, confirm, prevent || noop);
      }
    },

    confirm_with(fn: ConfirmationFunction): void {
      if (typeof fn !== "function") {
        throw new Error("confirm_with can only be passed a function");
      }
      confirm_function = fn;
    },

    remove_confirmation(): void {
      confirm_function = null;
    }
  };
}
