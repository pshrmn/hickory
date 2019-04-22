import { locationUtils, keyGenerator, navigateWith } from "@hickory/root";

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

export function inMemory(
  fn: ResponseHandler,
  options: InMemoryOptions = {}
): InMemoryHistory {
  const utils = locationUtils(options);
  const keygen = keyGenerator();

  let locations = initializeLocations(options.locations);
  let index = validIndex(options.index) ? options.index : 0;

  function validIndex(value: number | undefined): value is number {
    return value !== undefined && value >= 0 && value < locations.length;
  }
  function initializeLocations(
    locs: InputLocations = [{ url: "/" }]
  ): Array<SessionLocation> {
    return locs.map((loc: ToArgument) =>
      utils.keyed(utils.location(loc), keygen.major())
    );
  }

  const destroyLocation = () => {
    locations = [];
    index = -1;
  };

  function href(location: Hrefable): string {
    return utils.stringify(location);
  }

  let lastAction: Action = "push";

  const {
    emitNavigation,
    cancelPending,
    createNavigation,
    prepare
  } = navigateWith({
    responseHandler: fn,
    utils,
    keygen,
    current: () => memoryHistory.location,
    push: {
      finish(location: SessionLocation) {
        return () => {
          memoryHistory.location = location;
          index++;
          locations = [...locations.slice(0, index), location];
          lastAction = "push";
        };
      },
      cancel: noop
    },
    replace: {
      finish(location: SessionLocation) {
        return () => {
          memoryHistory.location = location;
          locations[index] = memoryHistory.location;
          lastAction = "replace";
        };
      },
      cancel: noop
    }
  });

  const memoryHistory: InMemoryHistory = {
    location: locations[index],
    current() {
      emitNavigation(
        createNavigation(memoryHistory.location, lastAction, noop, noop)
      );
    },
    href,
    cancel() {
      cancelPending();
    },
    destroy(): void {
      destroyLocation();
    },
    navigate(to: ToArgument, navType: NavType = "anchor"): void {
      const navigation = prepare(to, navType);
      cancelPending(navigation.action);
      emitNavigation(navigation);
    },
    go(num?: number): void {
      if (num == null || num === 0) {
        emitNavigation(
          createNavigation(
            memoryHistory.location,
            "pop",
            () => {
              lastAction = "pop";
            },
            noop
          )
        );
      } else {
        const originalIndex = index;
        const newIndex = originalIndex + num;
        if (newIndex < 0 || newIndex >= locations.length) {
          return;
        }

        // Immediately update the index; this simulates browser behavior.
        index = newIndex;

        const location: SessionLocation = locations[newIndex];
        emitNavigation(
          createNavigation(
            location,
            "pop",
            () => {
              memoryHistory.location = location;
              lastAction = "pop";
            },
            (nextAction?: Action) => {
              if (nextAction === "pop") {
                return;
              }
              index = originalIndex;
            }
          )
        );
      }
    },
    reset(options: SessionOptions = {}) {
      locations = initializeLocations(options.locations);
      index = validIndex(options.index) ? options.index : 0;
      memoryHistory.location = locations[index];
      lastAction = "push";

      cancelPending();
      emitNavigation(
        createNavigation(memoryHistory.location, lastAction, noop, noop)
      );
    }
  };

  return memoryHistory;
}
