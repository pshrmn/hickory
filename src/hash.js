import createCommonHistory from './common';
import createEventCoordinator from './utils/eventCoordinator';
import {
  stripPrefix,
  completeHash
} from './utils/location'
import {
  getStateFromHistory,
  domExists
} from './utils/domCompat';

function decodeHashPath(path) {
  return stripPrefix(path, '#');
}

function encodeHashPath(path) {
  return completeHash(path);
}

function ensureHash() {
  if (window.location.hash === '') {
    window.history.replaceState(null, '', '#/');
  }
}

export default function Hash(options = {}) {
  if (!domExists()) {
    return;
  }

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

  // when true, pop will run without attempting to get user confirmation
  let reverting = false;

  ensureHash();

  function locationFromBrowser(providedState) {
    let { hash } = window.location;
    const path = decodeHashPath(hash);
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = keygen.major();
      // replace with the hash we received, not the decoded path
      window.history.replaceState({ key, state }, '', hash);
    }
    return createLocation(path, key);
  }

  const hashHistory = {
    // location
    location: locationFromBrowser(),
    action: 'POP',
    // convenience
    createPath,
    subscribe,
    confirmWith,
    removeConfirmation,
    destroy: function destroy() {
      beforeDestroy.forEach(fn => { fn(); });
    }
  };


  hashHistory.update = function update(to) {
    const location = createLocation(to, null);
    const path = createPath(location);
    const currentPath = createPath(hashHistory.location);
    
    if (path === currentPath) {
      hashHistory.replace(to);
    } else {
      hashHistory.push(to);
    }
  }

  hashHistory.push = function push(to) {
    const key = keygen.major(hashHistory.location.key);
    const location = createLocation(to, key);
    confirmNavigation  (
      location,
      'PUSH',
      () => {
        const path = encodeHashPath(createPath(location));
        const { key, state } = location;
        window.history.pushState({ key, state }, '', path);
        hashHistory.location = location;
        hashHistory.action = 'PUSH';
        emit(hashHistory.location, 'PUSH');
      }
    );
  }

  hashHistory.replace = function replace(to) {
    // pass the current key to just increment the minor portion
    const key = keygen.minor(hashHistory.location.key);
    const location = createLocation(to, key);
    confirmNavigation(
      location,
      'REPLACE',
      () => {
        const path = encodeHashPath(createPath(location));
        const { key, state } = location;
        window.history.replaceState({key, state }, '', path);
        hashHistory.location = location;
        hashHistory.action = 'REPLACE';
        emit(hashHistory.location, 'REPLACE');
      }
    );
  }

  hashHistory.go = function go(num) {
    // calling window.history.go with no value reloads the page, but
    // we will just re-emit instead
    if (!num) {
      hashHistory.action = 'POP';
      emit(hashHistory.location, 'POP');
    } else {
      window.history.go(num);
    }
  }

  function pop(state) {
    // when we are reverting a pop (the user did not confirm navigation), we
    // just need to reset the boolean and return. The browser has already taken
    // care of updating the address bar and we never touched our internal values.
    if (reverting) {
      reverting = false;
      return;
    }
    const location = locationFromBrowser(state);
    const currentKey = hashHistory.location.key;
    const diff = keygen.diff(currentKey, location.key);
    confirmNavigation(
      location,
      'POP',
      () => {
        hashHistory.location = location;
        hashHistory.action = 'POP';
        emit(hashHistory.location, 'POP');
      },
      () => {
        reverting = true;

        window.history.go(-1*diff);
      }
    );
  }

  beforeDestroy.push(
    createEventCoordinator({
      hashchange: (event) => {
        pop(event.state);
      }
    })
  );

  return hashHistory;
}
