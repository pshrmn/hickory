import createCommonHistory from '@hickory/root';

import {
  History,
  HickoryLocation,
  PartialLocation,
  AnyLocation,
  ConfirmationFunction,
  Options as RootOptions,
  ToArgument,
  ResponseHandler,
  PendingNavigation,
  Action
} from '@hickory/root';

export { History, HickoryLocation, PartialLocation, AnyLocation };

export interface Options extends RootOptions {
  locations?: Array<string|PartialLocation>;
  index?: number;
}

export interface InMemoryHistory extends History {
  locations: Array<HickoryLocation>,
  index: number
}

function noop() {}

export default function InMemory(options: Options = {}): InMemoryHistory {
  const {
    createLocation,
    createPath,
    confirmNavigation,
    confirmWith,
    removeConfirmation,
    keygen
  } = createCommonHistory(options);

  const beforeDestroy: Array<() => void> = [
    () => {
      memoryHistory.locations = [];
      memoryHistory.index = undefined;
    }
  ];

  let initialLocations: Array<HickoryLocation>
  if (options.locations) {
    initialLocations = options.locations.map(loc => createLocation(loc, keygen.major()));
  } else {
    initialLocations = [ createLocation({ pathname: '/' }, keygen.major()) ];
  }

  let initialIndex = 0;
  if (options.index && options.index > 0 && options.index < initialLocations.length) {
    initialIndex = options.index;
  }

  function toHref(location: AnyLocation): string {
    return createPath(location);
  }

  let responseHandler: ResponseHandler;

  function finalizePush(location: HickoryLocation) {
    return () => {
      memoryHistory.location = location;
      memoryHistory.index++;
      memoryHistory.locations = [
        ...memoryHistory.locations.slice(0, memoryHistory.index),
        location
      ];
      memoryHistory.action = 'PUSH';
    }
  }

  function finalizeReplace(location: HickoryLocation) {
    return () => {
      memoryHistory.location = location;
      memoryHistory.locations[memoryHistory.index] = memoryHistory.location;
      memoryHistory.action = 'REPLACE';
    }
  }

  const memoryHistory: InMemoryHistory = {
    // location
    location: initialLocations[initialIndex],
    locations: initialLocations,
    index: initialIndex,
    action: 'PUSH',
    // set response handler
    respondWith: function(fn: ResponseHandler) {
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
    destroy: function destroy(): void {
      beforeDestroy.forEach(fn => { fn(); });
    },
    navigate: function navigate(to: ToArgument): void {
      const location: HickoryLocation = createLocation(to, null);
      const path: string = createPath(location);
      const currentPath: string = createPath(memoryHistory.location);
      if (path === currentPath) {
        memoryHistory.replace(to);
      } else {
        memoryHistory.push(to);
      }
    },
    push: function push(to: ToArgument): void {
      const key: string = keygen.major(memoryHistory.location.key);
      const location: HickoryLocation = createLocation(to, key);
      confirmNavigation(
        {
          to: location,
          from: memoryHistory.location,
          action: 'PUSH'
        },
        () => {
          if (!responseHandler) {
            return;
          }
          responseHandler({
            location,
            action: 'PUSH',
            finish: finalizePush(location),
            cancel: noop
          });
        }
      );
    },
    replace: function replace(to: ToArgument): void {
      const key: string = keygen.minor(memoryHistory.location.key);
      const location: HickoryLocation = createLocation(to, key);
      confirmNavigation(
        {
          to: location,
          from: memoryHistory.location,
          action: 'REPLACE'
        },
        () => {
          if (!responseHandler) {
            return;
          }
          responseHandler({
            location,
            action: 'REPLACE',
            finish: finalizeReplace(location),
            cancel: noop
          });
        }
      );
    },
    go: function go(num?: number): void {
      if (num == null || num === 0) {
        if (!responseHandler) {
          return;
        }
        responseHandler({
          location: memoryHistory.location,
          action: 'POP',
          finish: () => {
            memoryHistory.action = 'POP';
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
              action: 'PUSH'
            },
            () => {
              if (!responseHandler) {
                return;
              }
              responseHandler({
                location,
                action: 'POP',
                finish: () => {
                  memoryHistory.index = newIndex;
                  memoryHistory.location = location;
                  memoryHistory.action = 'POP';
                },
                cancel: noop
              });
            }
          );
        }
      }
    }
  };

  return memoryHistory;
}
