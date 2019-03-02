import {
  locationUtils,
  keyGenerator,
  prepareNavigate,
  navigationHandler
} from "@hickory/root";
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
import { Options, HashHistory } from "./types";

export * from "./types";

function ensureHash(encode: (path: string) => string): void {
  if (window.location.hash === "") {
    window.history.replaceState(null, "", encode("/"));
  }
}

export function Hash(options: Options = {}): HashHistory {
  if (!domExists()) {
    throw new Error("Cannot use @hickory/hash without a DOM");
  }

  if (!options.raw) {
    options.raw = ensureEncodedPathname;
  }

  const locationUtilities = locationUtils(options);
  const keygen = keyGenerator();
  const {
    emitNavigation,
    clearPending,
    cancelPending,
    setHandler
  } = navigationHandler();
  const prep = prepareNavigate({
    locationUtils: locationUtilities,
    keygen,
    current: () => hashHistory.location,
    push(location: SessionLocation) {
      return () => {
        const alreadyCleared = clearPending();
        if (alreadyCleared) {
          return;
        }
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
    replace(location: SessionLocation) {
      return () => {
        const alreadyCleared = clearPending();
        if (alreadyCleared) {
          return;
        }
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
    }
  });

  const {
    decode: decodeHashPath,
    encode: encodeHashPath
  } = hashEncoderAndDecoder(options.hashType);

  let reverting = false;
  function popstate(event: PopStateEvent) {
    if (reverting) {
      reverting = false;
      return;
    }
    pop(event.state);
  }

  window.addEventListener("popstate", popstate, false);

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

  let lastAction: Action =
    getStateFromHistory().key !== undefined ? "pop" : "push";

  const hashHistory: HashHistory = {
    // location
    location: locationFromBrowser(),
    // set response handler
    respondWith(fn: ResponseHandler) {
      setHandler(fn);
      cancelPending();
      emitNavigation({
        location: hashHistory.location,
        action: lastAction,
        finish: clearPending,
        cancel: clearPending
      });
    },
    // convenience
    toHref,
    cancel() {
      cancelPending();
    },
    destroy() {
      window.removeEventListener("popstate", popstate);
    },
    navigate(to: ToArgument, navType: NavType = "anchor"): void {
      const next = prep(to, navType);
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
    cancelPending("pop");

    const location: SessionLocation = locationFromBrowser(state);
    const currentKey: string = hashHistory.location.key;
    const diff: number = keygen.diff(currentKey, location.key);

    emitNavigation({
      location,
      action: "pop",
      finish: () => {
        const alreadyCleared = clearPending();
        if (alreadyCleared) {
          return;
        }
        hashHistory.location = location;
        lastAction = "pop";
      },
      cancel: (nextAction?: Action) => {
        const alreadyCleared = clearPending();
        if (alreadyCleared || nextAction === "pop") {
          return;
        }
        reverting = true;
        window.history.go(-1 * diff);
      }
    });
  }

  return hashHistory;
}
