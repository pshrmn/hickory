import { locationUtils, keyGenerator, navigateWith } from "@hickory/root";

import {
  SessionLocation,
  AnyLocation,
  ToArgument,
  ResponseHandler,
  NavType,
  Action
} from "@hickory/root";

import {
  InMemoryOptions,
  InMemoryHistory,
  InputLocation,
  InputLocations,
  SessionOptions
} from "./types";

export * from "./types";

function noop() {}

export function InMemory(
  fn: ResponseHandler,
  options: InMemoryOptions = {}
): InMemoryHistory {
  const locationUtilities = locationUtils(options);
  const keygen = keyGenerator();

  let locations = initializeLocations(options.locations);
  let index = validIndex(options.index) ? options.index : 0;

  function validIndex(value: number | undefined): value is number {
    return value !== undefined && value >= 0 && value < locations.length;
  }
  function initializeLocations(
    locs: InputLocations = ["/"]
  ): Array<SessionLocation> {
    return locs.map((loc: InputLocation) =>
      locationUtilities.keyed(
        locationUtilities.genericLocation(loc),
        keygen.major()
      )
    );
  }

  const destroyLocations = () => {
    locations = [];
    index = -1;
  };

  function toHref(location: AnyLocation): string {
    return locationUtilities.stringifyLocation(location);
  }

  let lastAction: Action = "push";

  const {
    emitNavigation,
    cancelPending,
    createNavigation,
    prepare
  } = navigateWith({
    responseHandler: fn,
    locationUtils: locationUtilities,
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
      const nav = createNavigation(
        memoryHistory.location,
        lastAction,
        noop,
        noop
      );
      emitNavigation(nav);
    },
    toHref,
    cancel() {
      cancelPending();
    },
    destroy(): void {
      destroyLocations();
    },
    navigate(to: ToArgument, navType: NavType = "anchor"): void {
      const navigation = prepare(to, navType);
      cancelPending(navigation.action);
      emitNavigation(navigation);
    },
    go(num?: number): void {
      if (num == null || num === 0) {
        const navigation = createNavigation(
          memoryHistory.location,
          "pop",
          () => {
            lastAction = "pop";
          },
          noop
        );
        emitNavigation(navigation);
      } else {
        const originalIndex = index;
        const newIndex = originalIndex + num;
        if (newIndex < 0 || newIndex >= locations.length) {
          return;
        }

        // Immediately update the index; this simulates browser behavior.
        index = newIndex;

        const location: SessionLocation = locations[newIndex];
        const navigation = createNavigation(
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
        );
        emitNavigation(navigation);
      }
    },
    reset(options: SessionOptions = {}) {
      locations = initializeLocations(options.locations);
      index = validIndex(options.index) ? options.index : 0;
      memoryHistory.location = locations[index];
      lastAction = "push";

      cancelPending();
      const navigation = createNavigation(
        memoryHistory.location,
        lastAction,
        noop,
        noop
      );
      emitNavigation(navigation);
    }
  };

  return memoryHistory;
}
