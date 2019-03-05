import { locationUtils } from "@hickory/root";

import {
  AnyLocation,
  ToArgument,
  ResponseHandler,
  NavType,
  Action
} from "@hickory/root";

import { InMemoryLiteOptions, InMemoryLiteHistory } from "./types";

function noop() {}

export function InMemoryLite(
  fn: ResponseHandler,
  options: InMemoryLiteOptions
): InMemoryLiteHistory {
  const locationUtilities = locationUtils(options);

  const location = locationUtilities.keyed(
    locationUtilities.genericLocation(options.location),
    [0, 0]
  );

  function toHref(location: AnyLocation): string {
    return locationUtilities.stringifyLocation(location);
  }

  let action: Action = "push";

  const memoryHistory: InMemoryLiteHistory = {
    location,
    current() {
      fn({
        location,
        action,
        finish: noop,
        cancel: noop
      });
    },
    toHref,
    cancel: noop,
    destroy: noop,
    navigate(to: ToArgument, navType: NavType = "anchor"): void {},
    go: noop
  };

  return memoryHistory;
}
