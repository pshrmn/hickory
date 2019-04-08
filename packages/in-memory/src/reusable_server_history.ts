import { location_utils } from "@hickory/root";

import {
  Hrefable,
  ResponseHandler,
  HistoryConstructor,
  HistoryOptions,
  History
} from "@hickory/root";

import { LocationOptions } from "./types";

function noop() {}

export function reusable_server_history(
  factory_options: HistoryOptions = {}
): HistoryConstructor<LocationOptions> {
  const utils = location_utils(factory_options);
  function href(location: Hrefable): string {
    return utils.stringify(location);
  }

  return function(fn: ResponseHandler, options: LocationOptions): History {
    const location = utils.keyed(utils.location(options.location), [0, 0]);

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
