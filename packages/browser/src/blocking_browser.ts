import {
  location_utils,
  key_generator,
  navigate_with,
  navigation_confirmation
} from "@hickory/root";
import {
  ignorable_popstate_event,
  get_state_from_history,
  dom_exists,
  verify_encoded_pathname
} from "@hickory/dom-utils";

import {
  SessionLocation,
  AnyLocation,
  ResponseHandler,
  ToArgument,
  NavType,
  Action
} from "@hickory/root";
import { BrowserHistoryOptions, BlockingBrowserHistory } from "./types";

function noop() {}

export function blocking_browser(
  fn: ResponseHandler,
  options: BrowserHistoryOptions = {}
): BlockingBrowserHistory {
  if (!dom_exists()) {
    throw new Error("Cannot use @hickory/browser without a DOM");
  }

  if (!options.pathname) {
    options.pathname = verify_encoded_pathname;
  }

  const location_utilities = location_utils(options);
  const keygen = key_generator();
  const blocking = navigation_confirmation();

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

    blocking.confirm_navigation(
      {
        to: location,
        from: browser_history.location,
        action: "pop"
      },
      () => {
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
      },
      () => {
        reverting = true;
        window.history.go(diff);
      }
    );
  }

  window.addEventListener("popstate", popstate, false);

  const browser_history: BlockingBrowserHistory = {
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
    confirm_with: blocking.confirm_with,
    remove_confirmation: blocking.remove_confirmation,
    cancel() {
      cancel_pending();
    },
    destroy() {
      window.removeEventListener("popstate", popstate);
    },
    navigate(to: ToArgument, nav_type: NavType = "anchor"): void {
      const navigation = prepare(to, nav_type);
      cancel_pending(navigation.action);
      blocking.confirm_navigation(
        {
          to: navigation.location,
          from: browser_history.location,
          action: navigation.action
        },
        () => {
          emit_navigation(navigation);
        }
      );
    },
    go(num: number): void {
      window.history.go(num);
    }
  };

  return browser_history;
}
