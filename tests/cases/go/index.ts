import ResponseHandler from "./response-handler";
import FinishingPop from "./finishing-pop";
import CancelWithPush from "./cancel-with-push";
import CancelWithReplace from "./cancel-with-replace";
import CancelWithPop from "./cancel-with-pop";

import { Suite } from "../../types";

export const goSuite: Suite = [
  ResponseHandler,
  FinishingPop,
  CancelWithPush,
  CancelWithReplace,
  CancelWithPop
];
