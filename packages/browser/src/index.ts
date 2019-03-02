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
  Action,
  PendingNavigation
} from "@hickory/root";
import { BrowserHistory, Options } from "./types";

export * from "./types";

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
        clearPending();
        const path = toHref(location);
        const { key, state } = location;
        try {
          window.history.pushState({ key, state }, "", path);
        } catch (e) {
          window.location.assign(path);
        }
        browserHistory.location = location;
        lastAction = "push";
      };
    },
    replace(location: SessionLocation) {
      return () => {
        clearPending();
        const path = toHref(location);
        const { key, state } = location;
        try {
          window.history.replaceState({ key, state }, "", path);
        } catch (e) {
          window.location.replace(path);
        }
        browserHistory.location = location;
        lastAction = "replace";
      };
    }
  });

  // when true, pop will ignore the navigation
  let reverting = false;
  function popstate(event: PopStateEvent) {
    if (reverting) {
      reverting = false;
      return;
    }
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

  // set action before location because locationFromBrowser enforces
  // that the location has a key
  let lastAction: Action =
    getStateFromHistory().key !== undefined ? "pop" : "push";
  let responseHandler: ResponseHandler | undefined;
  let pending: PendingNavigation | undefined;

  function emitNavigation(nav: PendingNavigation) {
    if (!responseHandler) {
      return;
    }
    pending = nav;
    responseHandler(nav);
  }

  function clearPending() {
    if (pending) {
      pending = undefined;
    }
  }

  function cancelPending(action?: Action) {
    if (pending) {
      pending.cancelled = true;
      pending.cancel(action);
      pending = undefined;
    }
  }

  const browserHistory: BrowserHistory = {
    location: locationFromBrowser(),
    respondWith(fn: ResponseHandler) {
      responseHandler = fn;
      cancelPending();
      emitNavigation({
        location: browserHistory.location,
        action: lastAction,
        finish: clearPending,
        cancel: clearPending
      });
    },
    toHref,
    cancel() {
      cancelPending();
    },
    destroy() {
      window.removeEventListener("popstate", popstate);
    },
    navigate(to: ToArgument, navType: NavType = "anchor"): void {
      const next = prepare(to, navType);
      cancelPending(next.action);
      emitNavigation({
        location: next.location,
        action: next.action,
        finish: next.finish,
        cancel: clearPending
      });
    },
    go(num: number): void {
      window.history.go(num);
    }
  };

  function pop(state: object): void {
    cancelPending("push");

    const location = locationFromBrowser(state);
    const currentKey = browserHistory.location.key;
    const diff = keygen.diff(currentKey, location.key);

    emitNavigation({
      location,
      action: "pop",
      finish: () => {
        clearPending();
        browserHistory.location = location;
        lastAction = "pop";
      },
      cancel: (nextAction: Action | undefined) => {
        clearPending();

        // popping while already popping is cumulative,
        // so don't undo the original pop
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
