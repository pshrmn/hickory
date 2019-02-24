import {
  locationUtils,
  keyGenerator,
  prepareNavigate,
  navigationConfirmation
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

function ensureHash(encode: (path: string) => string): void {
  if (window.location.hash === "") {
    window.history.replaceState(null, "", encode("/"));
  }
}

function noop() {}

function Hash<Q>(options: Options<Q> = {}): HashHistory<Q> {
  if (!domExists()) {
    throw new Error("Cannot use @hickory/hash without a DOM");
  }

  if (!options.raw) {
    options.raw = ensureEncodedPathname;
  }

  const locationUtilities = locationUtils(options);
  const keygen = keyGenerator();
  const prep = prepareNavigate({
    locationUtils: locationUtilities,
    keygen,
    current: () => hashHistory.location,
    push(location: SessionLocation<Q>) {
      return () => {
        const path = toHref(location);
        const { key, state } = location;
        try {
          window.history.pushState({ key, state }, "", path);
        } catch (e) {
          window.location.assign(path);
        }
        hashHistory.location = location;
        hashHistory.action = "push";
      };
    },
    replace(location: SessionLocation<Q>) {
      return () => {
        const path = toHref(location);
        const { key, state } = location;
        try {
          window.history.replaceState({ key, state }, "", path);
        } catch (e) {
          window.location.replace(path);
        }
        hashHistory.location = location;
        hashHistory.action = "replace";
      };
    }
  });

  const {
    decode: decodeHashPath,
    encode: encodeHashPath
  } = hashEncoderAndDecoder(options.hashType);

  function popstate(event: PopStateEvent) {
    pop(event.state);
  }

  window.addEventListener("popstate", popstate, false);

  // when true, pop will run without attempting to get user confirmation
  let reverting = false;

  ensureHash(encodeHashPath);

  function locationFromBrowser(providedState?: object): SessionLocation<Q> {
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

  function toHref(location: AnyLocation<Q>): string {
    return encodeHashPath(locationUtilities.stringifyLocation(location));
  }

  let responseHandler: ResponseHandler<Q> | undefined;
  const hashHistory: HashHistory<Q> = {
    // location
    action: getStateFromHistory().key !== undefined ? "pop" : "push",
    location: locationFromBrowser(),
    // set response handler
    respondWith(fn: ResponseHandler<Q>) {
      responseHandler = fn;
      responseHandler({
        location: hashHistory.location,
        action: hashHistory.action,
        finish: noop,
        cancel: noop
      });
    },
    // convenience
    toHref,
    destroy() {
      window.removeEventListener("popstate", popstate);
    },
    navigate(to: ToArgument<Q>, navType: NavType = "anchor"): void {
      const next = prep(to, navType);
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

  function pop(state: object): void {
    // when we are reverting a pop (the user did not confirm navigation), we
    // just need to reset the boolean and return. The browser has already taken
    // care of updating the address bar and we never touched our internal values.
    if (reverting) {
      reverting = false;
      return;
    }
    const location: SessionLocation<Q> = locationFromBrowser(state);
    const currentKey: string = hashHistory.location.key;
    const diff: number = keygen.diff(currentKey, location.key);
    if (!responseHandler) {
      return;
    }
    responseHandler({
      location,
      action: "pop",
      finish: () => {
        hashHistory.location = location;
        hashHistory.action = "pop";
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

  return hashHistory;
}

export { Hash };