import { locationUtils, keyGenerator, navigateWith } from "@hickory/root";
import {
  ignorablePopstateEvent,
  getStateFromHistory,
  domExists
} from "@hickory/dom-utils";

import {
  SessionLocation,
  Hrefable,
  ResponseHandler,
  ToArgument,
  NavType,
  Action
} from "@hickory/root";
import { BrowserHistoryOptions, BrowserHistory } from "./types";

export * from "./types";

function noop() {}

export function browser(
  fn: ResponseHandler,
  options: BrowserHistoryOptions = {}
): BrowserHistory {
  if (!domExists()) {
    throw new Error("Cannot use @hickory/browser without a DOM");
  }

  const utils = locationUtils(options);
  const keygen = keyGenerator();

  function fromBrowser(providedState?: object): SessionLocation {
    const { pathname, search, hash } = window.location;
    const path = pathname + search + hash;
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = keygen.major();
      window.history.replaceState({ key, state }, "", path);
    }
    const location = utils.location(path, state);
    return utils.keyed(location, key);
  }

  function href(location: Hrefable): string {
    return utils.stringify(location);
  }

  // set action before location because fromBrowser enforces
  // that the location has a key
  let lastAction: Action =
    getStateFromHistory().key !== undefined ? "pop" : "push";

  const {
    emitNavigation,
    cancelPending,
    createNavigation,
    prepare
  } = navigateWith({
    responseHandler: fn,
    utils,
    keygen,
    current: () => browserHistory.location,
    push: {
      finish(location: SessionLocation) {
        return () => {
          const path = href(location);
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
      cancel: noop
    },
    replace: {
      finish(location: SessionLocation) {
        return () => {
          const path = href(location);
          const { key, state } = location;
          try {
            window.history.replaceState({ key, state }, "", path);
          } catch (e) {
            window.location.replace(path);
          }
          browserHistory.location = location;
          lastAction = "replace";
        };
      },
      cancel: noop
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
    cancelPending("pop");

    const location = fromBrowser(event.state);
    const diff = browserHistory.location.key[0] - location.key[0];
    emitNavigation(
      createNavigation(
        location,
        "pop",
        () => {
          browserHistory.location = location;
          lastAction = "pop";
        },
        (nextAction?: Action) => {
          if (nextAction === "pop") {
            return;
          }
          reverting = true;
          window.history.go(diff);
        }
      )
    );
  }

  window.addEventListener("popstate", popstate, false);

  const browserHistory: BrowserHistory = {
    location: fromBrowser(),
    current() {
      emitNavigation(
        createNavigation(browserHistory.location, lastAction, noop, noop)
      );
    },
    href,
    cancel() {
      cancelPending();
    },
    destroy() {
      window.removeEventListener("popstate", popstate);
    },
    navigate(to: ToArgument, navType: NavType = "anchor"): void {
      const navigation = prepare(to, navType);
      cancelPending(navigation.action);
      emitNavigation(navigation);
    },
    go(num: number): void {
      window.history.go(num);
    }
  };

  return browserHistory;
}
