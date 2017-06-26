import createCommonHistory from './common';
import createEventCoordinator from './utils/eventCoordinator';
import {
  ignorablePopstateEvent,
  getStateFromHistory,
  domExists
} from './utils/domCompat';

export default function Browser(options = {}) {
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

  function locationFromBrowser(providedState) {
    const { pathname, search, hash } = window.location;
    const path = pathname + search + hash;
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = keygen.major();
      window.history.replaceState({ key, state }, '', path);
    }
    return createLocation(path, key, state);
  }

  function toHref(location) {
    return createPath(location);
  }

  const browserHistory = {
    // location
    location: locationFromBrowser(),
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

  browserHistory.update = function update(to) {
    const location = createLocation(to, null);
    const path = createPath(location);
    const currentPath = createPath(browserHistory.location);
    
    if (path === currentPath) {
      browserHistory.replace(to);
    } else {
      browserHistory.push(to);
    }
  };

  browserHistory.push = function push(to) {
    // the major version should be the current key + 1
    const key = keygen.major(browserHistory.location.key);
    const location = createLocation(to, key);
    confirmNavigation(
      {
        to: location,
        from: browserHistory.location,
        action: 'PUSH'
      },
      () => {
        const path = toHref(location);
        const { key, state } = location;
        window.history.pushState({ key, state }, '', path);
        browserHistory.location = location;
        browserHistory.action = 'PUSH';
        emit(browserHistory.location, 'PUSH');
      }
    );
  };

  browserHistory.replace = function replace(to) {
    // pass the current key to just increment the minor portion
    const key = keygen.minor(browserHistory.location.key);
    const location = createLocation(to, key);
    confirmNavigation(
      {
        to: location,
        from: browserHistory.location,
        action: 'REPLACE'
      },
      () => {
        const path = toHref(location);
        const { key, state } = location;
        window.history.replaceState({key, state}, '', path);
        browserHistory.location = location;
        browserHistory.action = 'REPLACE';
        emit(browserHistory.location, 'REPLACE');
      }
    );
  };

  browserHistory.go = function go(num) {
    // calling window.history.go with no value reloads the page, but
    // we will just re-emit instead
    if (!num) {
      browserHistory.action = 'POP';
      emit(browserHistory.location, 'POP');
    } else {
      window.history.go(num);
    }
  };

  function pop(state) {
    // when we are reverting a pop (the user did not confirm navigation), we
    // just need to reset the boolean and return. The browser has already taken
    // care of updating the address bar and we never touched our internal values.
    if (reverting) {
      reverting = false;
      return;
    }
    const location = locationFromBrowser(state);
    const currentKey = browserHistory.location.key;
    const diff = keygen.diff(currentKey, location.key);
    confirmNavigation(
      {
        to: location,
        from: browserHistory.location,
        action: 'POP'
      },
      () => {
        browserHistory.location = location;
        browserHistory.action = 'POP';
        emit(browserHistory.location, 'POP');
      },
      () => {
        reverting = true;
        window.history.go(-1*diff);
      }
    );
  }

  // need to listen for browser navigation events
  beforeDestroy.push(
    createEventCoordinator({
      popstate: (event) => {
        if (ignorablePopstateEvent(event)) {
          return;
        }
        pop(event.state);
      }
    })
  );

  return browserHistory;
}
