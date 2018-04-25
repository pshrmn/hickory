import createCommonHistory from "@hickory/root";
import {
  ignorablePopstateEvent,
  getStateFromHistory,
  domExists,
  createEventCoordinator,
  ensureEncodedPathname
} from "@hickory/dom-utils";

import {
  History,
  LocationDetails,
  PartialLocation,
  HickoryLocation,
  AnyLocation,
  ConfirmationFunction,
  Options as RootOptions,
  ToArgument,
  ResponseHandler,
  PendingNavigation,
  Action,
  NavType
} from "@hickory/root";

export {
  History,
  HickoryLocation,
  PartialLocation,
  AnyLocation,
  LocationDetails
};

export interface Options extends RootOptions {
  raw?: (pathname: string) => string;
}

interface NavSetup {
  action: Action;
  finish(): void;
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
      window.history.replaceState({ key, state }, "", path);
    }
    return createLocation(path, key, state);
  }

  function toHref(location: AnyLocation): string {
    return createPath(location);
  }

  function setupReplace(location: HickoryLocation): NavSetup {
    location.key = keygen.minor(browserHistory.location.key);
    return {
      action: "REPLACE",
      finish: finalizeReplace(location)
    };
  }

  function setupPush(location: HickoryLocation): NavSetup {
    location.key = keygen.major(browserHistory.location.key);
    return {
      action: "PUSH",
      finish: finalizePush(location)
    };
  }

  function finalizePush(location: HickoryLocation) {
    return () => {
      const path = toHref(location);
      const { key, state } = location;
      window.history.pushState({ key, state }, "", path);
      browserHistory.location = location;
      browserHistory.action = "PUSH";
    };
  }

  function finalizeReplace(location: HickoryLocation) {
    return () => {
      const path = toHref(location);
      const { key, state } = location;
      window.history.replaceState({ key, state }, "", path);
      browserHistory.location = location;
      browserHistory.action = "REPLACE";
    };
  }

  let responseHandler: ResponseHandler;
  const browserHistory = {
    // set action before location because locationFromBrowser enforces that the location has a key
    action: (getStateFromHistory().key !== undefined
      ? "POP"
      : "PUSH") as Action,
    location: locationFromBrowser(),
    // set response handler
    respondWith: function(fn: ResponseHandler) {
      responseHandler = fn;
      // immediately invoke
      fn({
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
    update: function update(to: ToArgument, navType: NavType = "ANCHOR"): void {
      let setup: NavSetup;
      const location = createLocation(to);
      switch (navType) {
        case "ANCHOR":
          setup =
            createPath(location) === createPath(browserHistory.location)
              ? setupReplace(location)
              : setupPush(location);
          break;
        case "PUSH":
          setup = setupPush(location);
          break;
        case "REPLACE":
          setup = setupReplace(location);
          break;
      }
      confirmNavigation(
        {
          to: location,
          from: browserHistory.location,
          action: setup.action
        },
        () => {
          if (!responseHandler) {
            return;
          }
          responseHandler({
            location,
            action: setup.action,
            finish: setup.finish,
            cancel: noop
          });
        }
      );
    },
    go: function go(num: number): void {
      window.history.go(num);
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
        action: "POP"
      },
      () => {
        if (!responseHandler) {
          return;
        }
        responseHandler({
          location,
          action: "POP",
          finish: () => {
            browserHistory.location = location;
            browserHistory.action = "POP";
          },
          cancel: (nextAction: Action) => {
            if (nextAction === "POP") {
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
