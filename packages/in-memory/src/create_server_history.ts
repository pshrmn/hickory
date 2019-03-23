import { location_utils } from "@hickory/root";

import {
  AnyLocation,
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
  function to_href(location: AnyLocation): string {
    return location_utilities.stringify_location(location);
  }

  return function(fn: ResponseHandler, options: LocationOptions): History {
    const location = location_utilities.keyed(
      location_utilities.generic_location(options.location),
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
      to_href,
      cancel: noop,
      destroy: noop,
      navigate: noop,
      go: noop
    };
  };
}
