import { location_utils, key_generator, navigate_with } from "@hickory/root";

import {
  SessionLocation,
  Hrefable,
  ToArgument,
  ResponseHandler,
  NavType,
  Action
} from "@hickory/root";

import {
  InMemoryOptions,
  InMemoryHistory,
  InputLocations,
  SessionOptions
} from "./types";

function noop() {}

export function in_memory(
  fn: ResponseHandler,
  options: InMemoryOptions = {}
): InMemoryHistory {
  const location_utilities = location_utils(options);
  const keygen = key_generator();

  let locations = initialize_locations(options.locations);
  let index = valid_index(options.index) ? options.index : 0;

  function valid_index(value: number | undefined): value is number {
    return value !== undefined && value >= 0 && value < locations.length;
  }
  function initialize_locations(
    locs: InputLocations = ["/"]
  ): Array<SessionLocation> {
    return locs.map((loc: Hrefable) =>
      location_utilities.keyed(location_utilities.location(loc), keygen.major())
    );
  }

  const destroy_locations = () => {
    locations = [];
    index = -1;
  };

  function href(location: Hrefable): string {
    return location_utilities.stringify(location);
  }

  let last_action: Action = "push";

  const {
    emit_navigation,
    cancel_pending,
    create_navigation,
    prepare
  } = navigate_with({
    response_handler: fn,
    location_utils: location_utilities,
    keygen,
    current: () => memory_history.location,
    push: {
      finish(location: SessionLocation) {
        return () => {
          memory_history.location = location;
          index++;
          locations = [...locations.slice(0, index), location];
          last_action = "push";
        };
      },
      cancel: noop
    },
    replace: {
      finish(location: SessionLocation) {
        return () => {
          memory_history.location = location;
          locations[index] = memory_history.location;
          last_action = "replace";
        };
      },
      cancel: noop
    }
  });

  const memory_history: InMemoryHistory = {
    location: locations[index],
    current() {
      const nav = create_navigation(
        memory_history.location,
        last_action,
        noop,
        noop
      );
      emit_navigation(nav);
    },
    href,
    cancel() {
      cancel_pending();
    },
    destroy(): void {
      destroy_locations();
    },
    navigate(to: ToArgument, nav_type: NavType = "anchor"): void {
      const navigation = prepare(to, nav_type);
      cancel_pending(navigation.action);
      emit_navigation(navigation);
    },
    go(num?: number): void {
      if (num == null || num === 0) {
        const navigation = create_navigation(
          memory_history.location,
          "pop",
          () => {
            last_action = "pop";
          },
          noop
        );
        emit_navigation(navigation);
      } else {
        const original_index = index;
        const new_index = original_index + num;
        if (new_index < 0 || new_index >= locations.length) {
          return;
        }

        // Immediately update the index; this simulates browser behavior.
        index = new_index;

        const location: SessionLocation = locations[new_index];
        const navigation = create_navigation(
          location,
          "pop",
          () => {
            memory_history.location = location;
            last_action = "pop";
          },
          (next_action?: Action) => {
            if (next_action === "pop") {
              return;
            }
            index = original_index;
          }
        );
        emit_navigation(navigation);
      }
    },
    reset(options: SessionOptions = {}) {
      locations = initialize_locations(options.locations);
      index = valid_index(options.index) ? options.index : 0;
      memory_history.location = locations[index];
      last_action = "push";

      cancel_pending();
      const navigation = create_navigation(
        memory_history.location,
        last_action,
        noop,
        noop
      );
      emit_navigation(navigation);
    }
  };

  return memory_history;
}
