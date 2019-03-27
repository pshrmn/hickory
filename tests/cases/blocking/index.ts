import PopConfirmNavigation from "./pop-confirm-navigation";
import PopPreventNavigation from "./pop-prevent-navigation";
import NavigateConfirmNavigation from "./navigate-confirm-navigation";
import NavigatePreventNavigation from "./navigate-prevent-navigation";
import { Suite } from "../../types";

export const blocking_suite: Suite = [
  PopConfirmNavigation,
  PopPreventNavigation,
  NavigateConfirmNavigation,
  NavigatePreventNavigation
];
