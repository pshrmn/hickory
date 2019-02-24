import { locationUtils, keyGenerator, prepareNavigate } from "@hickory/root";

import {
  SessionLocation,
  AnyLocation,
  ToArgument,
  ResponseHandler,
  NavType
} from "@hickory/root";

import {
  Options,
  InMemoryHistory,
  InputLocation,
  SessionOptions
} from "./types";

function noop() {}

export function InMemory<Q = string>(
  options: Options<Q> = {}
): InMemoryHistory<Q> {
  const locationUtilities = locationUtils(options);
  const keygen = keyGenerator();
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
    destroy(): void {
      destroyLocations();
    },
    navigate(to: ToArgument<Q>, navType: NavType = "anchor"): void {
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
