import { locationUtils } from "@hickory/root";

import {
  Hrefable,
  ResponseHandler,
  HistoryConstructor,
  HistoryOptions,
  History
} from "@hickory/root";

import { LocationOptions } from "./types";

function noop() {}

export function createReusable(
  options: HistoryOptions = {}
): HistoryConstructor<LocationOptions> {
  const utils = locationUtils(options);
  function href(location: Hrefable): string {
    return utils.stringify(location);
  }

  return function(fn: ResponseHandler, options: LocationOptions): History {
    const location = utils.keyed(
      utils.location(
        typeof options.location === "string"
          ? { url: options.location }
          : options.location
      ),
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
      href,
      cancel: noop,
      destroy: noop,
      navigate: noop,
      go: noop
    };
  };
}
