import { locationUtils, keyGenerator, navigateWith } from "@hickory/root";
import {
  getStateFromHistory,
  domExists,
  ensureEncodedPathname
} from "@hickory/dom-utils";
import hashEncoderAndDecoder from "./hashTypes";

import {
  SessionLocation,
  AnyLocation,
  ToArgument,
  ResponseHandler,
  Action,
  NavType
} from "@hickory/root";
import { Options, HashHistory, PendingHashHistory } from "./types";

export * from "./types";

function ensureHash(encode: (path: string) => string): void {
  if (window.location.hash === "") {
    window.history.replaceState(null, "", encode("/"));
  }
}

function noop() {}

export function Hash(options: Options = {}): PendingHashHistory {
  if (!domExists()) {
    throw new Error("Cannot use @hickory/hash without a DOM");
  }

  if (!options.raw) {
    options.raw = ensureEncodedPathname;
  }

  const locationUtilities = locationUtils(options);
  const keygen = keyGenerator();

  const {
    decode: decodeHashPath,
    encode: encodeHashPath
  } = hashEncoderAndDecoder(options.hashType);

  ensureHash(encodeHashPath);

  function locationFromBrowser(providedState?: object): SessionLocation {
    let { hash } = window.location;
    const path = decodeHashPath(hash);
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = keygen.major();
      // replace with the hash we received, not the decoded path
      window.history.replaceState({ key, state }, "", hash);
    }
    return locationUtilities.keyed(
      locationUtilities.genericLocation(path),
      key
    );
  }

  function toHref(location: AnyLocation): string {
    return encodeHashPath(locationUtilities.stringifyLocation(location));
  }

  return function pendingHashHistory(fn: ResponseHandler) {
    let lastAction: Action =
      getStateFromHistory().key !== undefined ? "pop" : "push";

    const {
      emitNavigation,
      cancelPending,
      createNavigation,
      prepare
    } = navigateWith({
      responseHandler: fn,
      locationUtils: locationUtilities,
      keygen,
      current: () => hashHistory.location,
      push: {
        finish(location: SessionLocation) {
          return () => {
            const path = toHref(location);
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
            const path = toHref(location);
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

      const location: SessionLocation = locationFromBrowser(event.state);
      const diff = hashHistory.location.key[0] - location.key[0];

      const navigation = createNavigation(
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
      );
      emitNavigation(navigation);
    }

    window.addEventListener("popstate", popstate, false);

    const hashHistory: HashHistory = {
      location: locationFromBrowser(),
      current() {
        const nav = createNavigation(
          hashHistory.location,
          lastAction,
          noop,
          noop
        );
        emitNavigation(nav);
      },
      toHref,
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
  };
}
