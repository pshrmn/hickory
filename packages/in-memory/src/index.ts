import { locationUtils, keyGenerator, prepareNavigate } from "@hickory/root";

import {
  SessionLocation,
  AnyLocation,
  ToArgument,
  ResponseHandler,
  NavType,
  Action
} from "@hickory/root";

import {
  Options,
  InMemoryHistory,
  InputLocation,
  InputLocations,
  SessionOptions
} from "./types";

function noop() {}

export * from "./types";

export function InMemory(options: Options = {}): InMemoryHistory {
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

  const prep = prepareNavigate({
    locationUtils: locationUtilities,
    keygen,
    current: () => memoryHistory.location,
    push(location: SessionLocation) {
      return () => {
        memoryHistory.location = location;
        index++;
        locations = [...locations.slice(0, index), location];
        lastAction = "push";
      };
    },
    replace(location: SessionLocation) {
      return () => {
        memoryHistory.location = location;
        locations[index] = memoryHistory.location;
        lastAction = "replace";
      };
    }
  });

  const destroyLocations = () => {
    locations = [];
    index = -1;
  };

  function toHref(location: AnyLocation): string {
    return locationUtilities.stringifyLocation(location);
  }

  let lastAction: Action = "push";
  let responseHandler: ResponseHandler | undefined;
  const memoryHistory: InMemoryHistory = {
    location: locations[index],
    respondWith(fn: ResponseHandler) {
      responseHandler = fn;
      responseHandler({
        location: memoryHistory.location,
        action: lastAction,
        finish: noop,
        cancel: noop
      });
    },
    toHref,
    destroy(): void {
      destroyLocations();
      responseHandler = undefined;
    },
    navigate(to: ToArgument, navType: NavType = "anchor"): void {
      const next = prep(to, navType);
      if (!responseHandler) {
        return;
      }
      responseHandler({
        location: next.location,
        action: next.action,
        finish: next.finish,
        cancel: noop
      });
    },
    go(num?: number): void {
      if (!responseHandler) {
        return;
      }
      if (num == null || num === 0) {
        responseHandler({
          location: memoryHistory.location,
          action: "pop",
          finish: () => {
            lastAction = "pop";
          },
          cancel: noop
        });
      } else {
        const originalIndex = index;
        const newIndex = originalIndex + num;
        if (newIndex < 0 || newIndex >= locations.length) {
          return;
        }

        // Immediately update the index; this simulates browser behavior.
        index = newIndex;

        const location: SessionLocation = locations[newIndex];
        responseHandler({
          location,
          action: "pop",
          finish: () => {
            memoryHistory.location = location;
            lastAction = "pop";
          },
          cancel: (nextAction: Action) => {
            if (nextAction === "pop") {
              return;
            }
            index = originalIndex;
          }
        });
      }
    },
    reset(options: SessionOptions = {}) {
      locations = initializeLocations(options.locations);
      index = validIndex(options.index) ? options.index : 0;
      memoryHistory.location = locations[index];
      lastAction = "push";
      if (!responseHandler) {
        return;
      }
      responseHandler({
        location: memoryHistory.location,
        action: lastAction,
        finish: noop,
        cancel: noop
      });
    }
  };

  return memoryHistory;
}
