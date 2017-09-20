import createCommonHistory from '@hickory/root';

import {
  History,
  HickoryLocation,
  PartialLocation,
  AnyLocation,
  SubscriberFn,
  ConfirmationFunction,
  Options as RootOptions,
  ToArgument
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

export default function InMemory(options: Options = {}): History {
  const {
    subscribe,
    emit,
    removeAllSubscribers,
    createLocation,
    createPath,
    confirmNavigation,
    confirmWith,
    removeConfirmation,
    keygen
  } = createCommonHistory(options);

  const beforeDestroy: Array<() => void> = [removeAllSubscribers];

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

  const memoryHistory: InMemoryHistory = {
    // location
    location: initialLocations[initialIndex],
    locations: initialLocations,
    index: initialIndex,
    action: 'PUSH',
    // convenience
    toHref,
    subscribe,
    confirmWith,
    removeConfirmation,
    destroy: function destroy(): void {
      beforeDestroy.forEach(fn => { fn(); });
    },
    update: function update(to: ToArgument): void {
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
          memoryHistory.location = location;
          memoryHistory.index++;
          memoryHistory.locations = [
            ...memoryHistory.locations.slice(0, memoryHistory.index),
            location
          ];
          memoryHistory.action = 'PUSH';
          emit(memoryHistory.location, 'PUSH');
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
          memoryHistory.location = location;
          memoryHistory.locations[memoryHistory.index] = memoryHistory.location;
          memoryHistory.action = 'REPLACE';
          emit(memoryHistory.location, 'REPLACE');
        }
      );
    },
    go: function go(num?: number): void {
      if (num == null || num === 0) {
        memoryHistory.action = 'POP';
        emit(memoryHistory.location, 'POP');
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
              memoryHistory.index = newIndex;
              memoryHistory.location = location;
              memoryHistory.action = 'POP';
              emit(memoryHistory.location, 'POP');
            }
          );
        }
      }
    }
  };

  return memoryHistory;
}
