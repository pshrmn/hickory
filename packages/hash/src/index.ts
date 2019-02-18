import { Common, PUSH, REPLACE, ANCHOR } from "@hickory/root";
import {
  getStateFromHistory,
  domExists,
  createEventCoordinator,
  ensureEncodedPathname
} from "@hickory/dom-utils";
import hashEncoderAndDecoder from "./hashTypes";

import {
  History,
  LocationDetails,
  HickoryLocation,
  PartialLocation,
  AnyLocation,
  Options as RootOptions,
  ToArgument,
  ResponseHandler,
  Action,
  NavType
} from "@hickory/root";

export {
  History,
  HickoryLocation,
  PartialLocation,
  AnyLocation,
  LocationDetails
};

function ensureHash(encode: (path: string) => string): void {
  if (window.location.hash === "") {
    window.history.replaceState(null, "", encode("/"));
  }
}

export interface Options extends RootOptions {
  raw?: (pathname: string) => string;
  hashType?: string;
}

interface NavSetup {
  action: Action;
  finish(): void;
}

function noop() {}

export default function HashHistory(options: Options = {}): History {
  if (!domExists()) {
    return;
  }

  if (!options.raw) {
    options.raw = ensureEncodedPathname;
  }

  const {
    createLocation,
    createPath,
    confirmNavigation,
    confirmWith,
    removeConfirmation,
    keygen
  } = Common(options);

  const {
    decode: decodeHashPath,
    encode: encodeHashPath
  } = hashEncoderAndDecoder(options.hashType);

  const removeEvents = createEventCoordinator({
    hashchange: (event: PopStateEvent) => {
      pop(event.state);
    }
  });

  // when true, pop will run without attempting to get user confirmation
  let reverting = false;

  ensureHash(encodeHashPath);

  function locationFromBrowser(providedState?: object): HickoryLocation {
    let { hash } = window.location;
    const path = decodeHashPath(hash);
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = keygen.major();
      // replace with the hash we received, not the decoded path
      window.history.replaceState({ key, state }, "", hash);
    }
    return createLocation(path, key);
  }

  function toHref(location: AnyLocation): string {
    return encodeHashPath(createPath(location));
  }

  function setupReplace(location: HickoryLocation): NavSetup {
    location.key = keygen.minor(hashHistory.location.key);
    return {
      action: "REPLACE",
      finish: finalizeReplace(location)
    };
  }

  function setupPush(location: HickoryLocation): NavSetup {
    location.key = keygen.major(hashHistory.location.key);
    return {
      action: "PUSH",
      finish: finalizePush(location)
    };
  }

  function finalizePush(location: HickoryLocation) {
    return () => {
      const path = toHref(location);
      const { key, state } = location;
      try {
        window.history.pushState({ key, state }, "", path);
      } catch (e) {
        window.location.assign(path);
      }
      hashHistory.location = location;
      hashHistory.action = "PUSH";
    };
  }

  function finalizeReplace(location: HickoryLocation) {
    return () => {
      const path = toHref(location);
      const { key, state } = location;
      try {
        window.history.replaceState({ key, state }, "", path);
      } catch (e) {
        window.location.replace(path);
      }
      hashHistory.location = location;
      hashHistory.action = "REPLACE";
    };
  }

  let responseHandler: ResponseHandler;
  const hashHistory: History = {
    // location
    action: (getStateFromHistory().key !== undefined
      ? "POP"
      : "PUSH") as Action,
    location: locationFromBrowser(),
    // set response handler
    respondWith(fn: ResponseHandler) {
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
      removeEvents();
    },
    navigate(to: ToArgument, navType: NavType = "ANCHOR"): void {
      let setup: NavSetup;
      const location = createLocation(to);
      switch (navType) {
        case "ANCHOR":
          setup =
            createPath(location) === createPath(hashHistory.location)
              ? setupReplace(location)
              : setupPush(location);
          break;
        case "PUSH":
          setup = setupPush(location);
          break;
        case "REPLACE":
          setup = setupReplace(location);
          break;
      }
      confirmNavigation(
        {
          to: location,
          from: hashHistory.location,
          action: setup.action
        },
        () => {
          if (!responseHandler) {
            return;
          }
          responseHandler({
            location,
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
    const location: HickoryLocation = locationFromBrowser(state);
    const currentKey: string = hashHistory.location.key;
    const diff: number = keygen.diff(currentKey, location.key);
    confirmNavigation(
      {
        to: location,
        from: hashHistory.location,
        action: "POP"
      },
      () => {
        if (!responseHandler) {
          return;
        }
        responseHandler({
          location,
          action: "POP",
          finish: () => {
            hashHistory.location = location;
            hashHistory.action = "POP";
          },
          cancel: (nextAction: Action) => {
            if (nextAction === "POP") {
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
