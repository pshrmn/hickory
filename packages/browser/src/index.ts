import encode_pathname from "encodeurl";
import { location_utils, key_generator, navigate_with } from "@hickory/root";
import {
  ignorable_popstate_event,
  get_state_from_history,
  dom_exists
} from "@hickory/dom-utils";

import {
  SessionLocation,
  AnyLocation,
  ResponseHandler,
  ToArgument,
  NavType,
  Action
} from "@hickory/root";
import { BrowserHistoryOptions, BrowserHistory } from "./types";

export * from "./types";

function noop() {}

export function Browser(
  fn: ResponseHandler,
  options: BrowserHistoryOptions = {}
): BrowserHistory {
  if (!dom_exists()) {
    throw new Error("Cannot use @hickory/browser without a DOM");
  }

  if (!options.pathname) {
    options.pathname = encode_pathname;
  }

  const location_utilities = location_utils(options);
  const keygen = key_generator();

  function location_from_browser(provided_state?: object): SessionLocation {
    const { pathname, search, hash } = window.location;
    const path = pathname + search + hash;
    let { key, state } = provided_state || get_state_from_history();
    if (!key) {
      key = keygen.major();
      window.history.replaceState({ key, state }, "", path);
    }
    const location = location_utilities.generic_location(path, state);
    return location_utilities.keyed(location, key);
  }

  function to_href(location: AnyLocation): string {
    return location_utilities.stringify_location(location);
  }

  // set action before location because location_from_browser enforces
  // that the location has a key
  let last_action: Action =
    get_state_from_history().key !== undefined ? "pop" : "push";

  const {
    emit_navigation,
    cancel_pending,
    create_navigation,
    prepare
  } = navigate_with({
    response_handler: fn,
    location_utils: location_utilities,
    keygen,
    current: () => browser_history.location,
    push: {
      finish(location: SessionLocation) {
        return () => {
          const path = to_href(location);
          const { key, state } = location;
          try {
            window.history.pushState({ key, state }, "", path);
          } catch (e) {
            window.location.assign(path);
          }
          browser_history.location = location;
          last_action = "push";
        };
      },
      cancel: noop
    },
    replace: {
      finish(location: SessionLocation) {
        return () => {
          const path = to_href(location);
          const { key, state } = location;
          try {
            window.history.replaceState({ key, state }, "", path);
          } catch (e) {
            window.location.replace(path);
          }
          browser_history.location = location;
          last_action = "replace";
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
    if (ignorable_popstate_event(event)) {
      return;
    }
    cancel_pending("pop");

    const location = location_from_browser(event.state);
    const diff = browser_history.location.key[0] - location.key[0];
    const navigation = create_navigation(
      location,
      "pop",
      () => {
        browser_history.location = location;
        last_action = "pop";
      },
      (next_action?: Action) => {
        if (next_action === "pop") {
          return;
        }
        reverting = true;
        window.history.go(diff);
      }
    );

    emit_navigation(navigation);
  }

  window.addEventListener("popstate", popstate, false);

  const browser_history: BrowserHistory = {
    location: location_from_browser(),
    current() {
      const nav = create_navigation(
        browser_history.location,
        last_action,
        noop,
        noop
      );
      emit_navigation(nav);
    },
    to_href,
    cancel() {
      cancel_pending();
    },
    destroy() {
      window.removeEventListener("popstate", popstate);
    },
    navigate(to: ToArgument, nav_type: NavType = "anchor"): void {
      const navigation = prepare(to, nav_type);
      cancel_pending(navigation.action);
      emit_navigation(navigation);
    },
    go(num: number): void {
      window.history.go(num);
    }
  };

  return browser_history;
}
