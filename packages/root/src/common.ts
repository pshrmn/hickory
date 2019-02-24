import createLocationUtils from "./locationFactory";
import createNavigationConfirmation from "./navigationConfirmation";
import createKeyGenerator from "./keygen";

import { CommonHistory, Options } from "./types/hickory";

export default function Common<Q>(options?: Options<Q>): CommonHistory<Q> {
  return {
    keygen: createKeyGenerator(),
    ...createLocationUtils<Q>(options),
    ...createNavigationConfirmation()
  };
}
