import { locationUtils } from "@hickory/root";

import {
  AnyLocation,
  ResponseHandler,
  HistoryConstructor,
  HistoryOptions,
  History
} from "@hickory/root";

import { LocationOptions } from "./types";

function noop() {}

export function createServerHistory(
  factoryOptions: HistoryOptions = {}
): HistoryConstructor<LocationOptions> {
  const locationUtilities = locationUtils(factoryOptions);
  function toHref(location: AnyLocation): string {
    return locationUtilities.stringifyLocation(location);
  }

  return function(fn: ResponseHandler, options: LocationOptions): History {
    const location = locationUtilities.keyed(
      locationUtilities.genericLocation(options.location),
      [0, 0]
    );

    return {
      location,
      current() {
        fn({
          location,
          action: "push",
          finish: noop,
          cancel: noop
        });
      },
      toHref,
      cancel: noop,
      destroy: noop,
      navigate: noop,
      go: noop
    };
  };
}
