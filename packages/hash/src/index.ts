import { Common } from "@hickory/root";
import {
  getStateFromHistory,
  domExists,
  ensureEncodedPathname
} from "@hickory/dom-utils";
import hashEncoderAndDecoder from "./hashTypes";

import {
  History,
  LocationComponents,
  SessionLocation,
  PartialLocation,
  Location,
  AnyLocation,
  Options as RootOptions,
  ToArgument,
  ResponseHandler,
  Action,
  NavType
} from "@hickory/root";

export {
  History,
  SessionLocation,
  PartialLocation,
  AnyLocation,
  Location,
  LocationComponents
};

function ensureHash(encode: (path: string) => string): void {
  if (window.location.hash === "") {
    window.history.replaceState(null, "", encode("/"));
  }
}

export interface Options<Q> extends RootOptions<Q> {
  raw?: (pathname: string) => string;
  hashType?: string;
}

interface NavSetup<Q> {
  action: Action;
  finish(): void;
  location: SessionLocation<Q>;
}

function noop() {}

function Hash<Q>(options: Options<Q> = {}): History<Q> {
  if (!domExists()) {
    throw new Error("Cannot use @hickory/hash without a DOM");
  }

  if (!options.raw) {
    options.raw = ensureEncodedPathname;
  }

  const {
    keyed,
    genericLocation,
    stringifyLocation,
    confirmNavigation,
    confirmWith,
    removeConfirmation,
    keygen
  } = Common<Q>(options);

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
    return keyed(genericLocation(path), key);
  }

  function toHref(location: AnyLocation<Q>): string {
    return encodeHashPath(stringifyLocation(location));
  }

  function setupReplace(location: Location<Q>): NavSetup<Q> {
    const finalLocation = keyed(
      location,
      keygen.minor(hashHistory.location.key)
    );
    return {
      action: "replace",
      finish: finalizeReplace(finalLocation),
      location: finalLocation
    };
  }

  function setupPush(location: Location<Q>): NavSetup<Q> {
    const finalLocation = keyed(
      location,
      keygen.major(hashHistory.location.key)
    );
    return {
      action: "push",
      finish: finalizePush(finalLocation),
      location: finalLocation
    };
  }

  function finalizePush(location: SessionLocation<Q>) {
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
  }

  function finalizeReplace(location: SessionLocation<Q>) {
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

  let responseHandler: ResponseHandler<Q>;
  const hashHistory: History<Q> = {
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
    confirmWith,
    removeConfirmation,
    destroy() {
      window.removeEventListener("popstate", popstate);
    },
    navigate(to: ToArgument<Q>, navType: NavType = "anchor"): void {
      let setup: NavSetup<Q>;
      const location = genericLocation(to);
      switch (navType) {
        case "anchor":
          setup =
            stringifyLocation(location) ===
            stringifyLocation(hashHistory.location)
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
          to: setup.location,
          from: hashHistory.location,
          action: setup.action
        },
        () => {
          if (!responseHandler) {
            return;
          }
          responseHandler({
            location: setup.location,
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
    const location: SessionLocation<Q> = locationFromBrowser(state);
    const currentKey: string = hashHistory.location.key;
    const diff: number = keygen.diff(currentKey, location.key);
    confirmNavigation(
      {
        to: location,
        from: hashHistory.location,
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
      },
      () => {
        reverting = true;
        window.history.go(-1 * diff);
      }
    );
  }

  return hashHistory;
}

export { Hash };
