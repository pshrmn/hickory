import createCommonHistory from '@hickory/root';
import {
  ignorablePopstateEvent,
  getStateFromHistory,
  domExists,
  createEventCoordinator,
  ensureEncodedPathname
} from '@hickory/dom-utils';

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
  raw?: (pathname: string) => string;
}

export default function Browser(options: Options = {}): History {
  if (!domExists()) {
    return;
  }

  if (!options.raw) {
    options.raw = ensureEncodedPathname;
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

  const beforeDestroy: Array<() => void> = [removeAllSubscribers];

  // when true, pop will run without attempting to get user confirmation
  let reverting = false;

  function locationFromBrowser(providedState?: object): HickoryLocation {
    const { pathname, search, hash } = window.location;
    const path = pathname + search + hash;
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = keygen.major();
      window.history.replaceState({ key, state }, '', path);
    }
    return createLocation(path, key, state);
  }

  function toHref(location: AnyLocation): string {
    return createPath(location);
  }

  const initialAction = getStateFromHistory().key !== undefined ? 'POP' : 'PUSH';

  const browserHistory = {
    // location
    location: locationFromBrowser(),
    action: initialAction,
    // convenience
    toHref,
    subscribe,
    confirmWith,
    removeConfirmation,
    destroy: function destroy() {
      beforeDestroy.forEach(fn => { fn(); });
    },
    update: function update(to: ToArgument): void {
      const location = createLocation(to, null);
      const path = createPath(location);
      const currentPath = createPath(browserHistory.location);
      
      if (path === currentPath) {
        browserHistory.replace(to);
      } else {
        browserHistory.push(to);
      }
    },
    push: function push(to: ToArgument): void {
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
    },
    replace: function replace(to: ToArgument): void {
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
    },
    go: function go(num: number): void {
      // calling window.history.go with no value reloads the page, but
      // we will just re-emit instead
      if (!num) {
        browserHistory.action = 'POP';
        emit(browserHistory.location, 'POP');
      } else {
        window.history.go(num);
      }
    }
  };

  function pop(state: object): void {
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
      popstate: (event: PopStateEvent) => {
        if (ignorablePopstateEvent(event)) {
          return;
        }
        pop(event.state);
      }
    })
  );

  return browserHistory;
}