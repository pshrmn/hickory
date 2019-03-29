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

export function create_server_history(
  factory_options: HistoryOptions = {}
): HistoryConstructor<LocationOptions> {
  const location_utilities = location_utils(factory_options);
  function href(location: Hrefable): string {
    return location_utilities.stringify(location);
  }

  return function(fn: ResponseHandler, options: LocationOptions): History {
    const location = location_utilities.keyed(
      location_utilities.location(options.location),
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
