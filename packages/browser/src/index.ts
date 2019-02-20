import { Common } from "@hickory/root";
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
  Options as RootOptions,
  ToArgument,
  ResponseHandler,
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

function Browser(options: Options = {}): History {
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
  } = Common(options);

  const removeEvents = createEventCoordinator({
    popstate: (event: PopStateEvent) => {
      if (ignorablePopstateEvent(event)) {
        return;
      }
      pop(event.state);
    }
  });

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
      action: "replace",
      finish: finalizeReplace(location)
    };
  }

  function setupPush(location: HickoryLocation): NavSetup {
    location.key = keygen.major(browserHistory.location.key);
    return {
      action: "push",
      finish: finalizePush(location)
    };
  }

  function finalizePush(location: HickoryLocation) {
    return () => {
      const path = toHref(location);
      const { key, state } = location;
      try {
        window.history.pushState({ key, state }, "", path);
      } catch (e) {
        window.location.assign(path);
      }
      browserHistory.location = location;
      browserHistory.action = "push";
    };
  }

  function finalizeReplace(location: HickoryLocation) {
    return () => {
      const path = toHref(location);
      const { key, state } = location;
      try {
        window.history.replaceState({ key, state }, "", path);
      } catch (e) {
        window.location.replace(path);
      }
      browserHistory.location = location;
      browserHistory.action = "replace";
    };
  }

  let responseHandler: ResponseHandler;
  const browserHistory: History = {
    // set action before location because locationFromBrowser enforces that the location has a key
    action: getStateFromHistory().key !== undefined ? "pop" : "push",
    location: locationFromBrowser(),
    // set response handler
    respondWith(fn: ResponseHandler) {
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
    destroy() {
      removeEvents();
    },
    navigate(to: ToArgument, navType: NavType = "anchor"): void {
      let setup: NavSetup;
      const location = createLocation(to);
      switch (navType) {
        case "anchor":
          setup =
            createPath(location) === createPath(browserHistory.location)
              ? setupReplace(location)
              : setupPush(location);
          break;
        case "push":
          setup = setupPush(location);
          break;
        case "replace":
          setup = setupReplace(location);
          break;
        default:
          throw new Error(`Invalid navigation type: ${navType}`);
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
    go(num: number): void {
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
        action: "pop"
      },
      () => {
        if (!responseHandler) {
          return;
        }
        responseHandler({
          location,
          action: "pop",
          finish: () => {
            browserHistory.location = location;
            browserHistory.action = "pop";
          },
          cancel: (nextAction: Action) => {
            if (nextAction === "pop") {
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

  return browserHistory;
}

export { Browser };
