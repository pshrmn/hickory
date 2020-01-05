import {
  locationUtils,
  keyGenerator,
  navigateWith,
  navigationConfirmation,
  createBase
} from "@hickory/root";
import { getStateFromHistory, domExists } from "@hickory/dom-utils";
import hashEncoderAndDecoder from "./hashTypes";

import {
  SessionLocation,
  Hrefable,
  URLWithState,
  ResponseHandler,
  Action,
  NavType
} from "@hickory/root";
import { HashOptions, HashHistory } from "./types";

export * from "./types";

export { createBase };

function ensureHash(encode: (path: string) => string): void {
  if (window.location.hash === "") {
    window.history.replaceState(null, "", encode("/"));
  }
}

function noop() {}

export function hash(
  fn: ResponseHandler,
  options: HashOptions = {}
): HashHistory {
  if (!domExists()) {
    throw new Error("Cannot use @hickory/hash without a DOM");
  }

  let locations = locationUtils(options);
  let keygen = keyGenerator();
  let blocking = navigationConfirmation();

  let {
    decode: decodeHashPath,
    encode: encodeHashPath
  } = hashEncoderAndDecoder(options.hashType);

  ensureHash(encodeHashPath);

  function fromBrowser(providedState?: object): SessionLocation {
    let { hash } = window.location;
    let url = decodeHashPath(hash);
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = keygen.major();
      // replace with the hash we received, not the decoded path
      window.history.replaceState({ key, state }, "", hash);
    }
    let location = locations.location({ url, state });
    return locations.keyed(location, key);
  }

  function url(location: Hrefable): string {
    return encodeHashPath(locations.stringify(location));
  }

  let lastAction: Action =
    getStateFromHistory().key !== undefined ? "pop" : "push";

  let {
    emitNavigation,
    cancelPending,
    createNavigation,
    prepare
  } = navigateWith({
    responseHandler: fn,
    utils: locations,
    keygen,
    current: () => hashHistory.location,
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
          hashHistory.location = location;
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
          hashHistory.location = location;
          lastAction = "replace";
        };
      },
      cancel: noop
    }
  });

  let reverting = false;
  function popstate(event: PopStateEvent) {
    if (reverting) {
      reverting = false;
      return;
    }
    cancelPending("pop");

    let location: SessionLocation = fromBrowser(event.state);
    let diff = hashHistory.location.key[0] - location.key[0];
    let revert = () => {
      reverting = true;
      window.history.go(diff);
    };
    blocking.confirmNavigation(
      {
        to: location,
        from: hashHistory.location,
        action: "pop"
      },
      () => {
        emitNavigation(
          createNavigation(
            location,
            "pop",
            () => {
              hashHistory.location = location;
              lastAction = "pop";
            },
            (nextAction?: Action) => {
              if (nextAction === "pop") {
                return;
              }
              revert();
            }
          )
        );
      },
      revert
    );
  }

  window.addEventListener("popstate", popstate, false);

  let hashHistory: HashHistory = {
    location: fromBrowser(),
    current() {
      emitNavigation(
        createNavigation(hashHistory.location, lastAction, noop, noop)
      );
    },
    url,
    navigate(to: URLWithState, navType: NavType = "anchor"): void {
      let navigation = prepare(to, navType);
      cancelPending(navigation.action);
      blocking.confirmNavigation(
        {
          to: navigation.location,
          from: hashHistory.location,
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
    confirm: blocking.confirm,
    cancel() {
      cancelPending();
    },
    destroy() {
      window.removeEventListener("popstate", popstate);
      emitNavigation = noop;
    }
  };

  return hashHistory;
}
