import {
  locationUtils,
  keyGenerator,
  prepareNavigate,
  navigationConfirmation
} from "@hickory/root";

import {
  History,
  BlockingHistory,
  LocationComponents,
  SessionLocation,
  PartialLocation,
  AnyLocation,
  Location,
  LocationUtilOptions,
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

export type InputLocation<Q> = string | PartialLocation<Q>;
export type InputLocations<Q> = Array<InputLocation<Q>>;

export interface SessionOptions<Q> {
  locations?: InputLocations<Q>;
  index?: number;
}

export type Options<Q> = LocationUtilOptions<Q> & SessionOptions<Q>;

export interface SessionHistory<Q> {
  locations: Array<SessionLocation<Q>>;
  index: number;
  reset(options?: SessionOptions<Q>): void;
}

export type InMemoryHistory<Q> = History<Q> &
  BlockingHistory<Q> &
  SessionHistory<Q>;

function noop() {}

function InMemory<Q = string>(options: Options<Q> = {}): InMemoryHistory<Q> {
  const locationUtilities = locationUtils(options);
  const keygen = keyGenerator();
  const blocking = navigationConfirmation<Q>();
  const prep = prepareNavigate({
    locationUtils: locationUtilities,
    keygen,
    current: () => memoryHistory.location,
    push(location: SessionLocation<Q>) {
      return () => {
        memoryHistory.location = location;
        memoryHistory.index++;
        memoryHistory.locations = [
          ...memoryHistory.locations.slice(0, memoryHistory.index),
          location
        ];
        memoryHistory.action = "push";
      };
    },
    replace(location: SessionLocation<Q>) {
      return () => {
        memoryHistory.location = location;
        memoryHistory.locations[memoryHistory.index] = memoryHistory.location;
        memoryHistory.action = "replace";
      };
    }
  });

  const destroyLocations = () => {
    memoryHistory.locations = [];
    memoryHistory.index = -1;
  };

  let initialLocations: Array<SessionLocation<Q>> = (
    options.locations || ["/"]
  ).map((loc: InputLocation<Q>) =>
    locationUtilities.keyed(
      locationUtilities.genericLocation(loc),
      keygen.major()
    )
  );
  let initialIndex = 0;
  if (
    options.index &&
    options.index > 0 &&
    options.index < initialLocations.length
  ) {
    initialIndex = options.index;
  }

  function toHref(location: AnyLocation<Q>): string {
    return locationUtilities.stringifyLocation(location);
  }

  let responseHandler: ResponseHandler<Q> | undefined;
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
    confirmWith: blocking.confirmWith,
    removeConfirmation: blocking.removeConfirmation,
    destroy(): void {
      destroyLocations();
    },
    navigate(to: ToArgument<Q>, navType: NavType = "anchor"): void {
      const next = prep(to, navType);
      blocking.confirmNavigation(
        {
          to: next.location,
          from: memoryHistory.location,
          action: next.action
        },
        () => {
          if (!responseHandler) {
            return;
          }
          responseHandler({
            location: next.location,
            action: next.action,
            finish: next.finish,
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
          blocking.confirmNavigation(
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
    reset(options?: SessionOptions<Q>) {
      memoryHistory.locations = ((options && options.locations) || ["/"]).map(
        loc =>
          locationUtilities.keyed(
            locationUtilities.genericLocation(loc),
            keygen.major()
          )
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
