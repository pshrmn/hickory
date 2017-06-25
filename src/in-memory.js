import createCommonHistory from './common';

export default function InMemory(options = {}) {
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

  const beforeDestroy = [removeAllSubscribers];

  let initialLocations;
  if (options.locations) {
    initialLocations = options.locations.map(loc => {
      return createLocation(loc, keygen.major())
    });
  } else {
    initialLocations = [
      createLocation({ pathname: '/' }, keygen.major())
    ];
  }

  let initialIndex = 0;
  if (options.index && options.index > 0 && options.index < initialLocations.length) {
    initialIndex = options.index;
  }

  function toHref(location) {
    return createPath(location);
  }

  const memoryHistory = {
    // location
    location: initialLocations[initialIndex],
    locations: initialLocations,
    index: initialIndex,
    action: 'POP',
    // convenience
    toHref,
    subscribe,
    confirmWith,
    removeConfirmation,
    destroy: function destroy() {
      beforeDestroy.forEach(fn => { fn(); });
    }
  };

  memoryHistory.update = function update(to) {
    const location = createLocation(to, null);
    const path = createPath(location);
    const currentPath = createPath(memoryHistory.location);
    if (path === currentPath) {
      memoryHistory.replace(to);
    } else {
      memoryHistory.push(to);
    }
  }

  memoryHistory.push = function push(to) {
    const key = keygen.major(memoryHistory.location.key);
    const location = createLocation(to, key);
    confirmNavigation  (
      location,
      'PUSH',
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
  }

  memoryHistory.replace = function replace(to) {
    const key = keygen.minor(memoryHistory.location.key);
    const location = createLocation(to, key);
    confirmNavigation(
      location,
      'REPLACE',
      () => {
        memoryHistory.location = location;
        memoryHistory.locations[memoryHistory.index] = memoryHistory.location;
        memoryHistory.action = 'REPLACE';
        emit(memoryHistory.location, 'REPLACE');
      }
    );
  }

  memoryHistory.go = function go(num) {
    if (num == null || num === 0) {
      memoryHistory.action = 'POP';
      emit(memoryHistory.location, 'POP');
    } else {
      const newIndex = memoryHistory.index + num;
      if (newIndex < 0 || newIndex >= memoryHistory.locations.length) {
        return;
      } else {
        confirmNavigation(
          memoryHistory.locations[newIndex],
          'POP',
          () => {
            memoryHistory.index = newIndex;
            memoryHistory.location = memoryHistory.locations[memoryHistory.index];
            memoryHistory.action = 'POP';
            emit(memoryHistory.location, 'POP');
          }
        )
      }
    }
  }

  return memoryHistory;
}
