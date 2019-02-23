import { Common } from "@hickory/root";

import {
  History,
  LocationComponents,
  SessionLocation,
  PartialLocation,
  AnyLocation,
  Location,
  Options as RootOptions,
  ToArgument,
  ResponseHandler,
  Action,
  NavType
} from "@hickory/root";

export {
  History,
  SessionLocation,
  PartialLocation,
  AnyLocation,
  Location,
  LocationComponents
};

export type InputLocations<Q> = Array<string | PartialLocation<Q>>;

export interface Options<Q> extends RootOptions<Q> {
  locations?: InputLocations<Q>;
  index?: number;
}

export interface ResetOptions<Q> {
  locations?: InputLocations<Q>;
  index?: number;
}

export interface InMemoryHistory<Q> extends History<Q> {
  locations: Array<SessionLocation<Q>>;
  index: number;
  reset(options?: ResetOptions<Q>): void;
}

interface NavSetup<Q> {
  action: Action;
  location: SessionLocation<Q>;
  finish(): void;
}

function noop() {}

function InMemory<Q = string>(options: Options<Q> = {}): InMemoryHistory<Q> {
  const {
    genericLocation,
    keyed,
    stringifyLocation,
    confirmNavigation,
    confirmWith,
    removeConfirmation,
    keygen
  } = Common<Q>(options);

  const destroyLocations = () => {
    memoryHistory.locations = [];
    memoryHistory.index = 0;
  };

  let initialLocations: Array<SessionLocation<Q>> = (
    options.locations || ["/"]
  ).map(loc => keyed(genericLocation(loc), keygen.major()));
  let initialIndex = 0;
  if (
    options.index &&
    options.index > 0 &&
    options.index < initialLocations.length
  ) {
    initialIndex = options.index;
  }

  function toHref(location: AnyLocation<Q>): string {
    return stringifyLocation(location);
  }

  function setupReplace(location: Location<Q>): NavSetup<Q> {
    const finalLocation = keyed(
      location,
      keygen.minor(memoryHistory.location.key)
    );
    return {
      action: "replace",
      location: finalLocation,
      finish: finalizeReplace(finalLocation)
    };
  }

  function setupPush(location: Location<Q>): NavSetup<Q> {
    const finalLocation = keyed(
      location,
      keygen.major(memoryHistory.location.key)
    );
    return {
      action: "push",
      location: finalLocation,
      finish: finalizePush(finalLocation)
    };
  }

  function finalizePush(location: SessionLocation<Q>) {
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

  function finalizeReplace(location: SessionLocation<Q>) {
    return () => {
      memoryHistory.location = location;
      memoryHistory.locations[memoryHistory.index] = memoryHistory.location;
      memoryHistory.action = "replace";
    };
  }

  let responseHandler: ResponseHandler<Q>;
  const memoryHistory: InMemoryHistory<Q> = {
    // location
    location: initialLocations[initialIndex],
    locations: initialLocations,
    index: initialIndex,
    action: "push",
    // set response handler
    respondWith(fn: ResponseHandler<Q>) {
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
    navigate(to: ToArgument<Q>, navType: NavType = "anchor"): void {
      let setup: NavSetup<Q>;
      const location = genericLocation(to);
      switch (navType) {
        case "anchor":
          setup =
            stringifyLocation(location) ===
            stringifyLocation(memoryHistory.location)
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
          to: setup.location,
          from: memoryHistory.location,
          action: setup.action
        },
        () => {
          if (!responseHandler) {
            return;
          }
          responseHandler({
            location: setup.location,
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
          const location: SessionLocation<Q> =
            memoryHistory.locations[newIndex];
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
    reset(options?: ResetOptions<Q>) {
      memoryHistory.locations = ((options && options.locations) || ["/"]).map(
        loc => keyed(genericLocation(loc), keygen.major())
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
