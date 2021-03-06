import {
  locationUtils,
  keyGenerator,
  navigateWith,
  confirmation,
  createBase
} from "@hickory/root";
import {
  ignorablePopstateEvent,
  getStateFromHistory,
  domExists
} from "@hickory/dom-utils";

import {
  SessionLocation,
  Hrefable,
  ResponseHandler,
  URLWithState,
  NavType,
  Action
} from "@hickory/root";
import { BrowserHistoryOptions, BrowserHistory } from "./types";

export * from "./types";

export { createBase };

function noop() {}

export function browser(
  fn: ResponseHandler,
  options: BrowserHistoryOptions = {}
): BrowserHistory {
  if (!domExists()) {
    throw new Error("Cannot use @hickory/browser without a DOM");
  }

  let utils = locationUtils(options);
  let keygen = keyGenerator();
  let { confirm, confirmNavigation } = confirmation();

  function fromBrowser(providedState?: object): SessionLocation {
    let { pathname, search, hash } = window.location;
    let url = pathname + search + hash;
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = keygen.major();
      window.history.replaceState({ key, state }, "", url);
    }
    let location = utils.location({ url, state });
    return utils.keyed(location, key);
  }

  function url(location: Hrefable): string {
    return utils.stringify(location);
  }

  // set action before location because fromBrowser enforces
  // that the location has a key
  let lastAction: Action =
    getStateFromHistory().key !== undefined ? "pop" : "push";

  let {
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
          let path = url(location);
          let { key, state } = location;
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
          let path = url(location);
          let { key, state } = location;
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

    let location = fromBrowser(event.state);
    let diff = browserHistory.location.key[0] - location.key[0];
    let revert = () => {
      reverting = true;
      window.history.go(diff);
    };
    confirmNavigation(
      {
        to: location,
        from: browserHistory.location,
        action: "pop"
      },
      () => {
        emitNavigation(
          createNavigation(
            location,
            "pop",
            () => {
              browserHistory.location = location;
              lastAction = "pop";
            },
            (nextAction?: Action) => {
              if (nextAction !== "pop") {
                revert();
              }
            }
          )
        );
      },
      revert
    );
  }

  window.addEventListener("popstate", popstate, false);

  let browserHistory: BrowserHistory = {
    location: fromBrowser(),
    current() {
      emitNavigation(
        createNavigation(browserHistory.location, lastAction, noop, noop)
      );
    },
    url,
    navigate(to: URLWithState, navType: NavType = "anchor"): void {
      let navigation = prepare(to, navType);
      cancelPending(navigation.action);
      confirmNavigation(
        {
          to: navigation.location,
          from: browserHistory.location,
          action: navigation.action
        },
        () => {
          emitNavigation(navigation);
        }
      );
    },
    go(num: number): void {
      window.history.go(num);
    },
    confirm,
    cancel() {
      cancelPending();
    },
    destroy() {
      window.removeEventListener("popstate", popstate);
      emitNavigation = noop;
    }
  };

  return browserHistory;
}
