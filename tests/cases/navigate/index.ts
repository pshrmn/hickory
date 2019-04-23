import WithResponseHandler from "./with-response-handler";
import InvalidMethod from "./invalid-method";
import To from "./to";
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
import FinishLocation from "./finish-sets-location";
import CancelCall from "./cancel-call-location";

import { Suite } from "../../types";

export const navigateSuite: Suite = [
  WithResponseHandler,
  InvalidMethod,
  To,
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
  FinishLocation,
  CancelCall
];
