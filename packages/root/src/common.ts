import createLocationUtils from "./locationFactory";
import createNavigationConfirmation from "./navigationConfirmation";
import createKeyGenerator from "./keygen";

import { CommonHistory, Options } from "./types/hickory";

export default function Common(options?: Options): CommonHistory {
  return {
    ...createLocationUtils(options),
    ...createNavigationConfirmation(),
    ...createKeyGenerator()
  };
}
