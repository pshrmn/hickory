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
  ConfirmationFunction,
  Options as RootOptions,
  ToArgument,
  ResponseHandler,
  PendingNavigation,
  Action
} from '@hickory/root';

export { History, HickoryLocation, PartialLocation, AnyLocation };

export interface Options extends RootOptions {
  raw?: (pathname: string) => string;
}

function noop() {}

export default function Browser(options: Options = {}): History {
  if (!domExists()) {
    return;
  }

  if (!options.raw) {
    options.raw = ensureEncodedPathname;
  }

  const {
    createLocation,
    createPath,
    confirmNavigation,
    confirmWith,
    removeConfirmation,
    keygen
  } = createCommonHistory(options);

  const beforeDestroy: Array<() => void> = [];

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

  let responseHandler: ResponseHandler;

  function finalizePush(location: HickoryLocation) {
    return () => {
      const path = toHref(location);
      const { key, state } = location;
      window.history.pushState({ key, state }, '', path);
      browserHistory.location = location;
      browserHistory.action = 'PUSH';
    };
  }

  function finalizeReplace(location: HickoryLocation) {
    return () => {
      const path = toHref(location);
      const { key, state } = location;
      window.history.replaceState({ key, state }, '', path);
      browserHistory.location = location;
      browserHistory.action = 'REPLACE';
    };
  }

  const browserHistory = {
    // set action before location because locationFromBrowser enforces that the location has a key
    action: (getStateFromHistory().key !== undefined
      ? 'POP'
      : 'PUSH') as Action,
    location: locationFromBrowser(),
    // set response handler
    respondWith: function(fn: ResponseHandler) {
      responseHandler = fn;
      responseHandler({
        location: browserHistory.location,
        action: browserHistory.action,
        finish: noop,
        cancel: noop
      });
    },
    // convenience
    toHref,
    confirmWith,
    removeConfirmation,
    destroy: function destroy() {
      beforeDestroy.forEach(fn => {
        fn();
      });
    },
    // navigation
    navigate: function navigate(to: ToArgument): void {
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
    go: function go(num: number): void {
      // Calling window.history.go with no value reloads the page. Instead
      // we will just call the responseHandler with the current location
      if (!num) {
        if (!responseHandler) {
          return;
        }
        responseHandler({
          location: browserHistory.location,
          action: 'POP',
          finish: () => {
            browserHistory.action = 'POP';
          },
          cancel: noop
        });
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
        if (!responseHandler) {
          return;
        }
        responseHandler({
          location,
          action: 'POP',
          finish: () => {
            browserHistory.location = location;
            browserHistory.action = 'POP';
          },
          cancel: (nextAction: Action) => {
            if (nextAction === 'POP') {
              return;
            }
            reverting = true;
            window.history.go(-1 * diff);
          }
        });
      },
      () => {
        reverting = true;
        window.history.go(-1 * diff);
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
