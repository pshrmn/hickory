import { locationUtils, keyGenerator, navigateWith } from "@hickory/root";
import { getStateFromHistory, domExists } from "@hickory/dom-utils";
import hashEncoderAndDecoder from "./hashTypes";

import {
  SessionLocation,
  Hrefable,
  ToArgument,
  ResponseHandler,
  Action,
  NavType
} from "@hickory/root";
import { HashOptions, HashHistory } from "./types";

export * from "./types";

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

  const utils = locationUtils(options);
  const keygen = keyGenerator();

  const {
    decode: decodeHashPath,
    encode: encodeHashPath
  } = hashEncoderAndDecoder(options.hashType);

  ensureHash(encodeHashPath);

  function fromBrowser(providedState?: object): SessionLocation {
    let { hash } = window.location;
    const path = decodeHashPath(hash);
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = keygen.major();
      // replace with the hash we received, not the decoded path
      window.history.replaceState({ key, state }, "", hash);
    }
    return utils.keyed(utils.location(path), key);
  }

  function href(location: Hrefable): string {
    return encodeHashPath(utils.stringify(location));
  }

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
    current: () => hashHistory.location,
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
          hashHistory.location = location;
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

    const location: SessionLocation = fromBrowser(event.state);
    const diff = hashHistory.location.key[0] - location.key[0];

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
          reverting = true;
          window.history.go(diff);
        }
      )
    );
  }

  window.addEventListener("popstate", popstate, false);

  const hashHistory: HashHistory = {
    location: fromBrowser(),
    current() {
      emitNavigation(
        createNavigation(hashHistory.location, lastAction, noop, noop)
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

  return hashHistory;
}
