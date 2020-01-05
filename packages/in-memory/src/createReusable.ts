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
  let utils = locationUtils(options);
  function url(location: Hrefable): string {
    return utils.stringify(location);
  }

  return function(fn: ResponseHandler, options: LocationOptions): History {
    let location = utils.keyed(utils.location(options.location), [0, 0]);

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
      url,
      cancel: noop,
      destroy: noop,
      navigate: noop,
      go: noop,
      confirm: noop
    };
  };
}
