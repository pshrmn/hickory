import { SessionLocation, LocationComponents } from "./types/location";
import {
  PendingNavigation,
  FinishNavigation,
  CancelNavigation,
  Action,
  ToArgument,
  NavType,
  NavigateArgs,
  NavigateHelpers
} from "./types/navigate";

export default function navigation_handler(
  args: NavigateArgs
): NavigateHelpers {
  const {
    response_handler,
    location_utils,
    keygen,
    current,
    push,
    replace
  } = args;
  let pending: PendingNavigation | undefined;

  function create_navigation(
    location: SessionLocation,
    action: Action,
    finish: FinishNavigation,
    cancel: CancelNavigation
  ): PendingNavigation {
    const navigation = {
      location,
      action,
      finish() {
        if (
          navigation.cancelled ||
          pending === undefined ||
          pending !== navigation
        ) {
          return;
        }
        finish();
        pending = undefined;
      },
      cancel(next_action?: Action) {
        if (
          navigation.cancelled ||
          pending === undefined ||
          pending !== navigation
        ) {
          return;
        }
        cancel(next_action);
        navigation.cancelled = true;
        pending = undefined;
      },
      cancelled: false
    };
    return navigation;
  }

  function emit_navigation(nav: PendingNavigation) {
    pending = nav;
    response_handler(nav);
  }

  function cancel_pending(action?: Action) {
    if (pending) {
      pending.cancel(action);
      pending = undefined;
    }
  }

  function prepare(to: ToArgument, nav_type: NavType) {
    const location = location_utils.generic_location(to);
    switch (nav_type) {
      case "anchor":
        return location_utils.stringify_location(location) ===
          location_utils.stringify_location(current())
          ? replace_nav(location)
          : push_nav(location);
      case "push":
        return push_nav(location);
      case "replace":
        return replace_nav(location);
      default:
        throw new Error(`Invalid navigation type: ${nav_type}`);
    }
  }

  function replace_nav(location: LocationComponents): PendingNavigation {
    const keyed_location = location_utils.keyed(
      location,
      keygen.minor(current().key)
    );
    return create_navigation(
      keyed_location,
      "replace",
      replace.finish(keyed_location),
      replace.cancel
    );
  }

  function push_nav(location: LocationComponents): PendingNavigation {
    const keyed_location = location_utils.keyed(
      location,
      keygen.major(current().key)
    );
    return create_navigation(
      keyed_location,
      "push",
      push.finish(keyed_location),
      push.cancel
    );
  }

  return {
    prepare,
    emit_navigation,
    create_navigation,
    cancel_pending
  };
}
