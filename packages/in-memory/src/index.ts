import { Common } from "@hickory/root";

import {
  History,
  LocationDetails,
  HickoryLocation,
  PartialLocation,
  AnyLocation,
  Options as RootOptions,
  ToArgument,
  ResponseHandler,
  Action,
  NavType
} from "@hickory/root";

export {
  History,
  HickoryLocation,
  PartialLocation,
  AnyLocation,
  LocationDetails
};

export type InputLocations = Array<string | PartialLocation>;

export interface Options extends RootOptions {
  locations?: InputLocations;
  index?: number;
}

export interface ResetOptions {
  locations?: InputLocations;
  index?: number;
}

export interface InMemoryHistory extends History {
  locations: Array<HickoryLocation>;
  index: number;
  reset(options?: ResetOptions): void;
}

interface NavSetup {
  action: Action;
  finish(): void;
}

function noop() {}

function InMemory(options: Options = {}): InMemoryHistory {
  const {
    createLocation,
    createPath,
    confirmNavigation,
    confirmWith,
    removeConfirmation,
    keygen
  } = Common(options);

  const destroyLocations = () => {
    memoryHistory.locations = [];
    memoryHistory.index = undefined;
  };

  let initialLocations: Array<HickoryLocation> = (
    options.locations || ["/"]
  ).map(loc => createLocation(loc, keygen.major()));
  let initialIndex = 0;
  if (
    options.index &&
    options.index > 0 &&
    options.index < initialLocations.length
  ) {
    initialIndex = options.index;
  }

  function toHref(location: AnyLocation): string {
    return createPath(location);
  }

  function setupReplace(location: HickoryLocation): NavSetup {
    location.key = keygen.minor(memoryHistory.location.key);
    return {
      action: "replace",
      finish: finalizeReplace(location)
    };
  }

  function setupPush(location: HickoryLocation): NavSetup {
    location.key = keygen.major(memoryHistory.location.key);
    return {
      action: "push",
      finish: finalizePush(location)
    };
  }

  function finalizePush(location: HickoryLocation) {
    return () => {
      memoryHistory.location = location;
      memoryHistory.index++;
      memoryHistory.locations = [
        ...memoryHistory.locations.slice(0, memoryHistory.index),
        location
      ];
      memoryHistory.action = "push";
    };
  }

  function finalizeReplace(location: HickoryLocation) {
    return () => {
      memoryHistory.location = location;
      memoryHistory.locations[memoryHistory.index] = memoryHistory.location;
      memoryHistory.action = "replace";
    };
  }

  let responseHandler: ResponseHandler;
  const memoryHistory: InMemoryHistory = {
    // location
    location: initialLocations[initialIndex],
    locations: initialLocations,
    index: initialIndex,
    action: "push",
    // set response handler
    respondWith(fn: ResponseHandler) {
      responseHandler = fn;
      responseHandler({
        location: memoryHistory.location,
        action: memoryHistory.action,
        finish: noop,
        cancel: noop
      });
    },
    // convenience
    toHref,
    confirmWith,
    removeConfirmation,
    destroy(): void {
      destroyLocations();
    },
    navigate(to: ToArgument, navType: NavType = "anchor"): void {
      let setup: NavSetup;
      const location = createLocation(to);
      switch (navType) {
        case "anchor":
          setup =
            createPath(location) === createPath(memoryHistory.location)
              ? setupReplace(location)
              : setupPush(location);
          break;
        case "push":
          setup = setupPush(location);
          break;
        case "replace":
          setup = setupReplace(location);
          break;
        default:
          throw new Error(`Invalid navigation type: ${navType}`);
      }
      confirmNavigation(
        {
          to: location,
          from: memoryHistory.location,
          action: setup.action
        },
        () => {
          if (!responseHandler) {
            return;
          }
          responseHandler({
            location,
            action: setup.action,
            finish: setup.finish,
            cancel: noop
          });
        }
      );
    },
    go(num?: number): void {
      if (num == null || num === 0) {
        if (!responseHandler) {
          return;
        }
        responseHandler({
          location: memoryHistory.location,
          action: "pop",
          finish: () => {
            memoryHistory.action = "pop";
          },
          cancel: noop
        });
      } else {
        const newIndex: number = memoryHistory.index + num;
        if (newIndex < 0 || newIndex >= memoryHistory.locations.length) {
          return;
        } else {
          const location: HickoryLocation = memoryHistory.locations[newIndex];
          confirmNavigation(
            {
              to: location,
              from: memoryHistory.location,
              action: "push"
            },
            () => {
              if (!responseHandler) {
                return;
              }
              responseHandler({
                location,
                action: "pop",
                finish: () => {
                  memoryHistory.index = newIndex;
                  memoryHistory.location = location;
                  memoryHistory.action = "pop";
                },
                cancel: noop
              });
            }
          );
        }
      }
    },
    reset(options?: ResetOptions) {
      memoryHistory.locations = ((options && options.locations) || ["/"]).map(
        loc => createLocation(loc, keygen.major())
      );
      memoryHistory.index =
        options && options.index != undefined ? options.index : 0;
      // set index to 0 when it is out of bounds
      if (
        memoryHistory.index < 0 ||
        memoryHistory.index >= memoryHistory.locations.length
      ) {
        memoryHistory.index = 0;
      }
      memoryHistory.location = memoryHistory.locations[memoryHistory.index];
      memoryHistory.action = "push";
      if (!responseHandler) {
        return;
      }
      responseHandler({
        location: memoryHistory.location,
        action: memoryHistory.action,
        finish: noop,
        cancel: noop
      });
    }
  };

  return memoryHistory;
}

export { InMemory };
