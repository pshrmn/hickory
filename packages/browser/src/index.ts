import { locationUtils, keyGenerator, prepareNavigate } from "@hickory/root";
import {
  ignorablePopstateEvent,
  getStateFromHistory,
  domExists,
  ensureEncodedPathname
} from "@hickory/dom-utils";

import {
  SessionLocation,
  AnyLocation,
  ResponseHandler,
  ToArgument,
  NavType,
  Action
} from "@hickory/root";
import { BrowserHistory, Options } from "./types";

export * from "./types";

function noop() {}

export function Browser(options: Options = {}): BrowserHistory {
  if (!domExists()) {
    throw new Error("Cannot use @hickory/browser without a DOM");
  }

  if (!options.raw) {
    options.raw = ensureEncodedPathname;
  }

  const locationUtilities = locationUtils(options);
  const keygen = keyGenerator();

  const prepare = prepareNavigate({
    locationUtils: locationUtilities,
    keygen,
    current: () => browserHistory.location,
    push(location: SessionLocation) {
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
    },
    replace(location: SessionLocation) {
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
  });

  function popstate(event: PopStateEvent) {
    if (ignorablePopstateEvent(event)) {
      return;
    }
    pop(event.state);
  }

  window.addEventListener("popstate", popstate, false);

  function locationFromBrowser(providedState?: object): SessionLocation {
    const { pathname, search, hash } = window.location;
    const path = pathname + search + hash;
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = keygen.major();
      window.history.replaceState({ key, state }, "", path);
    }
    const location = locationUtilities.genericLocation(path, state);
    return locationUtilities.keyed(location, key);
  }

  function toHref(location: AnyLocation): string {
    return locationUtilities.stringifyLocation(location);
  }

  let responseHandler: ResponseHandler | undefined;
  const browserHistory: BrowserHistory = {
    // set action before location because locationFromBrowser enforces that the location has a key
    action: getStateFromHistory().key !== undefined ? "pop" : "push",
    location: locationFromBrowser(),
    // set response handler
    respondWith(fn: ResponseHandler) {
      responseHandler = fn;
      // immediately invoke
      responseHandler({
        location: browserHistory.location,
        action: browserHistory.action,
        finish: noop,
        cancel: noop
      });
    },
    // convenience
    toHref,
    destroy() {
      window.removeEventListener("popstate", popstate);
    },
    navigate(to: ToArgument, navType: NavType = "anchor"): void {
      const next = prepare(to, navType);

      if (!responseHandler) {
        return;
      }
      responseHandler({
        location: next.location,
        action: next.action,
        finish: next.finish,
        cancel: noop
      });
    },
    go(num: number): void {
      window.history.go(num);
    }
  };

  // when true, pop will run without attempting to get user confirmation
  let reverting = false;

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
  }

  return browserHistory;
}
