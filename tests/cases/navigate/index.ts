import NavigateNoResponseHandler from "./no-response-handler";
import WithResponseHandler from "./with-response-handler";
import InvalidMethod from "./invalid-method";
import ToIsString from "./to-is-string";
import ToIsObject from "./to-is-object";
import PushingIncrementsKeyMajor from "./push-increments-key-major";
import ReplaceIncrementsKeyMinor from "./replace-increments-key-minor";
import NavigateNoMethodNewLocation from "./navigate-no-method-new-location";
import NavigateNoMethodSameLocation from "./navigate-no-method-same-location";
import NavigateAnchorNewLocation from "./navigate-anchor-new-location";
import NavigateAnchorSameLocation from "./navigate-anchor-same-location";
import NavigatePush from "./navigate-push";
import NavigateReplace from "./navigate-replace";
import FinishCallSetsLocation from "./finish-call-sets-location";
import FinishNotCalled from "./finish-not-called";
import FinishPush from "./finish-push-sets-action";
import FinishReplace from "./finish-replace-sets-action";
import CancelCall from "./cancel-call-location";

import { Suite } from "../../types";

export const navigateSuite: Suite = [
  NavigateNoResponseHandler,
  WithResponseHandler,
  InvalidMethod,
  ToIsString,
  ToIsObject,
  PushingIncrementsKeyMajor,
  ReplaceIncrementsKeyMinor,
  NavigateNoMethodNewLocation,
  NavigateNoMethodSameLocation,
  NavigateAnchorNewLocation,
  NavigateAnchorSameLocation,
  NavigatePush,
  NavigateReplace,
  FinishCallSetsLocation,
  FinishNotCalled,
  FinishPush,
  FinishReplace,
  CancelCall
];
