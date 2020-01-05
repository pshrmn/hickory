import {
  locationUtils,
  keyGenerator,
  navigateWith,
  navigationConfirmation
} from "@hickory/root";

import {
  SessionLocation,
  Hrefable,
  URLWithState,
  ResponseHandler,
  NavType,
  Action
} from "@hickory/root";

import {
  InMemoryOptions,
  BlockingInMemoryHistory,
  InputLocations,
  SessionOptions
} from "./types";

function noop() {}

export function blockingInMemory(
  fn: ResponseHandler,
  options: InMemoryOptions = {}
): BlockingInMemoryHistory {
  let lu = locationUtils(options);
  let keygen = keyGenerator();
  let blocking = navigationConfirmation();

  let locations = initializeLocations(options.locations);
  let index = validIndex(options.index) ? options.index : 0;

  function validIndex(value: number | undefined): value is number {
    return value !== undefined && value >= 0 && value < locations.length;
  }
  function initializeLocations(
    locs: InputLocations = [{ url: "/" }]
  ): Array<SessionLocation> {
    return locs.map((loc: URLWithState) =>
      lu.keyed(lu.location(loc), keygen.major())
    );
  }

  let destroyLocation = () => {
    locations = [];
    index = -1;
  };

  function url(location: Hrefable): string {
    return lu.stringify(location);
  }

  let lastAction: Action = "push";

  let {
    emitNavigation,
    cancelPending,
    createNavigation,
    prepare
  } = navigateWith({
    responseHandler: fn,
    utils: lu,
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

  let memoryHistory: BlockingInMemoryHistory = {
    location: locations[index],
    current() {
      emitNavigation(
        createNavigation(memoryHistory.location, lastAction, noop, noop)
      );
    },
    url,
    confirm: blocking.confirm,
    cancel() {
      cancelPending();
    },
    destroy(): void {
      destroyLocation();
      emitNavigation = noop;
    },
    navigate(to: URLWithState, navType: NavType = "anchor"): void {
      let navigation = prepare(to, navType);
      cancelPending(navigation.action);
      blocking.confirmNavigation(
        {
          to: navigation.location,
          from: memoryHistory.location,
          action: navigation.action
        },
        () => {
          emitNavigation(navigation);
        }
      );
    },
    go(num?: number): void {
      if (num == null || num === 0) {
        blocking.confirmNavigation(
          {
            to: memoryHistory.location,
            from: memoryHistory.location,
            action: "pop"
          },
          () => {
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
          }
        );
      } else {
        let originalIndex = index;
        let newIndex = originalIndex + num;
        if (newIndex < 0 || newIndex >= locations.length) {
          return;
        }

        // Immediately update the index; this simulates browser behavior.
        index = newIndex;
        let revert = () => {
          index = originalIndex;
        };
        let location: SessionLocation = locations[newIndex];
        blocking.confirmNavigation(
          {
            to: location,
            from: memoryHistory.location,
            action: "pop"
          },
          () => {
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
                  revert();
                }
              )
            );
          },
          revert
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
