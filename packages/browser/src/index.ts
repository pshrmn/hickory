import { Common, prepNavigate } from "@hickory/root";
import {
  ignorablePopstateEvent,
  getStateFromHistory,
  domExists,
  ensureEncodedPathname
} from "@hickory/dom-utils";

import {
  History,
  LocationComponents,
  PartialLocation,
  SessionLocation,
  AnyLocation,
  Location,
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

export interface Options<Q> extends RootOptions<Q> {
  raw?: (pathname: string) => string;
}

function noop() {}

function Browser<Q = string>(options: Options<Q> = {}): History<Q> {
  if (!domExists()) {
    throw new Error("Cannot use @hickory/browser without a DOM");
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

  function popstate(event: PopStateEvent) {
    if (ignorablePopstateEvent(event)) {
      return;
    }
    pop(event.state);
  }

  window.addEventListener("popstate", popstate, false);

  // when true, pop will run without attempting to get user confirmation
  let reverting = false;

  function locationFromBrowser(providedState?: object): SessionLocation<Q> {
    const { pathname, search, hash } = window.location;
    const path = pathname + search + hash;
    let { key, state } = providedState || getStateFromHistory();
    if (!key) {
      key = keygen.major();
      window.history.replaceState({ key, state }, "", path);
    }
    const location = genericLocation(path, state);
    return keyed(location, key);
  }

  function toHref(location: AnyLocation<Q>): string {
    return stringifyLocation(location);
  }

  const prep = prepNavigate({
    utils: { stringifyLocation, keyed, keygen, genericLocation },
    current: () => browserHistory.location,
    push(location: SessionLocation<Q>) {
      return () => {
        const path = toHref(location);
        const { key, state } = location;
        try {
          window.history.pushState({ key, state }, "", path);
        } catch (e) {
          window.location.assign(path);
        }
        browserHistory.location = location;
        browserHistory.action = "push";
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
        browserHistory.location = location;
        browserHistory.action = "replace";
      };
    }
  });

  let responseHandler: ResponseHandler<Q> | undefined;
  const browserHistory: History<Q> = {
    // set action before location because locationFromBrowser enforces that the location has a key
    action: getStateFromHistory().key !== undefined ? "pop" : "push",
    location: locationFromBrowser(),
    // set response handler
    respondWith(fn: ResponseHandler<Q>) {
      responseHandler = fn;
      // immediately invoke
      responseHandler({
        location: browserHistory.location,
        action: browserHistory.action,
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
      const next = prep(to, navType);
      confirmNavigation(
        {
          to: next.location,
          from: browserHistory.location,
          action: next.action
        },
        () => {
          if (!responseHandler) {
            return;
          }
          responseHandler({
            location: next.location,
            action: next.action,
            finish: next.finish,
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
    const location = locationFromBrowser(state);
    const currentKey = browserHistory.location.key;
    const diff = keygen.diff(currentKey, location.key);
    confirmNavigation(
      {
        to: location,
        from: browserHistory.location,
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
            browserHistory.location = location;
            browserHistory.action = "pop";
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

  return browserHistory;
}

export { Browser };
