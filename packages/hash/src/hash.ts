import { location_utils, key_generator, navigate_with } from "@hickory/root";
import { get_state_from_history, dom_exists } from "@hickory/dom-utils";
import hash_encoder_and_decoder from "./hashTypes";

import {
  SessionLocation,
  AnyLocation,
  ToArgument,
  ResponseHandler,
  Action,
  NavType
} from "@hickory/root";
import { HashOptions, HashHistory } from "./types";

export * from "./types";

function ensure_hash(encode: (path: string) => string): void {
  if (window.location.hash === "") {
    window.history.replaceState(null, "", encode("/"));
  }
}

function noop() {}

export function hash(
  fn: ResponseHandler,
  options: HashOptions = {}
): HashHistory {
  if (!dom_exists()) {
    throw new Error("Cannot use @hickory/hash without a DOM");
  }

  const location_utilities = location_utils(options);
  const keygen = key_generator();

  const {
    decode: decode_hash_path,
    encode: encode_hash_path
  } = hash_encoder_and_decoder(options.hash_type);

  ensure_hash(encode_hash_path);

  function location_from_browser(provided_state?: object): SessionLocation {
    let { hash } = window.location;
    const path = decode_hash_path(hash);
    let { key, state } = provided_state || get_state_from_history();
    if (!key) {
      key = keygen.major();
      // replace with the hash we received, not the decoded path
      window.history.replaceState({ key, state }, "", hash);
    }
    return location_utilities.keyed(
      location_utilities.generic_location(path),
      key
    );
  }

  function to_href(location: AnyLocation): string {
    return encode_hash_path(location_utilities.stringify_location(location));
  }

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
    current: () => hash_history.location,
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
          hash_history.location = location;
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
          hash_history.location = location;
          last_action = "replace";
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
    cancel_pending("pop");

    const location: SessionLocation = location_from_browser(event.state);
    const diff = hash_history.location.key[0] - location.key[0];

    const navigation = create_navigation(
      location,
      "pop",
      () => {
        hash_history.location = location;
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

  const hash_history: HashHistory = {
    location: location_from_browser(),
    current() {
      const nav = create_navigation(
        hash_history.location,
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

  return hash_history;
}
