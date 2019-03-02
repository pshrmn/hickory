import { locationUtils, keyGenerator, prepareNavigate } from "@hickory/root";

import {
  SessionLocation,
  AnyLocation,
  ToArgument,
  ResponseHandler,
  NavType,
  Action,
  PendingNavigation
} from "@hickory/root";

import {
  Options,
  InMemoryHistory,
  InputLocation,
  InputLocations,
  SessionOptions
} from "./types";

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
        clearPending();
        memoryHistory.location = location;
        index++;
        locations = [...locations.slice(0, index), location];
        lastAction = "push";
      };
    },
    replace(location: SessionLocation) {
      return () => {
        clearPending();
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
  let pending: PendingNavigation | undefined;

  function emitNavigation(nav: PendingNavigation) {
    if (!responseHandler) {
      return;
    }
    pending = nav;
    responseHandler(nav);
  }

  function clearPending() {
    if (pending) {
      pending = undefined;
    }
  }

  function cancelPending(action?: Action) {
    if (pending) {
      pending.cancelled = true;
      pending.cancel(action);
      pending = undefined;
    }
  }

  const memoryHistory: InMemoryHistory = {
    location: locations[index],
    respondWith(fn: ResponseHandler) {
      responseHandler = fn;
      cancelPending();
      emitNavigation({
        location: memoryHistory.location,
        action: lastAction,
        finish: clearPending,
        cancel: clearPending
      });
    },
    toHref,
    cancel() {
      cancelPending();
    },
    destroy(): void {
      destroyLocations();
      responseHandler = undefined;
    },
    navigate(to: ToArgument, navType: NavType = "anchor"): void {
      const next = prep(to, navType);
      cancelPending(next.action);
      emitNavigation({
        location: next.location,
        action: next.action,
        finish: next.finish,
        cancel: clearPending
      });
    },
    go(num?: number): void {
      if (num == null || num === 0) {
        emitNavigation({
          location: memoryHistory.location,
          action: "pop",
          finish: () => {
            clearPending();
            lastAction = "pop";
          },
          cancel: clearPending
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
        emitNavigation({
          location,
          action: "pop",
          finish: () => {
            clearPending();
            memoryHistory.location = location;
            lastAction = "pop";
          },
          cancel: (nextAction?: Action) => {
            clearPending();
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

      cancelPending();
      emitNavigation({
        location: memoryHistory.location,
        action: lastAction,
        finish: clearPending,
        cancel: clearPending
      });
    }
  };

  return memoryHistory;
}
