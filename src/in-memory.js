import createCommonHistory from './base';

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
      const key = keygen.major();
      if (Array.isArray(loc)) {
        const [value, state] = loc;
        return createLocation(value, key, state);
      } else {
        return createLocation(loc, key);
      }
    })
  } else {
    initialLocations = [
      createLocation({ pathname: '/' }, keygen.major())
    ];
  }

  let initialIndex = 0;
  if (options.index && options.index > 0 && options.index < initialLocations.length) {
    initialIndex = options.index;
  }

  const memoryHistory = {
    // location
    location: initialLocations[initialIndex],
    locations: initialLocations,
    index: initialIndex,
    action: 'POP',
    // convenience
    createLocation,
    createPath,
    subscribe,
    confirmWith,
    removeConfirmation,
    destroy: function destroy() {
      beforeDestroy.forEach(fn => { fn(); });
    }
  };

  memoryHistory.navigate = function navigate(to, state) {
    const location = createLocation(to, state, null);
    const path = createPath(location);
    const currentPath = createPath(memoryHistory.location);
    if (path === currentPath) {
      memoryHistory.replace(to, state);
    } else {
      memoryHistory.push(to, state);
    }
  }

  memoryHistory.push = function push(to, state) {
    const key = keygen.major(memoryHistory.location.key);
    const location = createLocation(to, key, state);
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

  memoryHistory.replace = function replace(to, state) {
    const key = keygen.minor(memoryHistory.location.key);
    const location = createLocation(to, key, state);
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
