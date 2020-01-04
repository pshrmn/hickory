import {
  SessionLocation,
  LocationComponents,
  URLWithState
} from "./types/location";
import {
  PendingNavigation,
  FinishNavigation,
  CancelNavigation,
  Action,
  NavType,
  NavigateArgs,
  NavigateHelpers
} from "./types/navigate";

export default function navigateWith(args: NavigateArgs): NavigateHelpers {
  let { responseHandler, utils, keygen, current, push, replace } = args;
  let pending: PendingNavigation | undefined;

  function createNavigation(
    location: SessionLocation,
    action: Action,
    finish: FinishNavigation,
    cancel: CancelNavigation
  ): PendingNavigation {
    let navigation = {
      location,
      action,
      finish() {
        if (pending !== navigation) {
          return;
        }
        finish();
        pending = undefined;
      },
      cancel(nextAction?: Action) {
        if (pending !== navigation) {
          return;
        }
        cancel(nextAction);
        navigation.cancelled = true;
        pending = undefined;
      },
      cancelled: false
    };
    return navigation;
  }

  function emitNavigation(nav: PendingNavigation) {
    pending = nav;
    responseHandler(nav);
  }

  function cancelPending(action?: Action) {
    if (pending) {
      pending.cancel(action);
      pending = undefined;
    }
  }

  function prepare(to: URLWithState, navType: NavType) {
    let currentLocation = current();
    let location = utils.location(to, currentLocation);
    switch (navType) {
      case "anchor":
        return utils.stringify(location) === utils.stringify(currentLocation)
          ? replaceNav(location)
          : pushNav(location);
      case "push":
        return pushNav(location);
      case "replace":
        return replaceNav(location);
      default:
        throw new Error(`Invalid navigation type: ${navType}`);
    }
  }

  function replaceNav(location: LocationComponents): PendingNavigation {
    let keyed = utils.keyed(location, keygen.minor(current().key));
    return createNavigation(
      keyed,
      "replace",
      replace.finish(keyed),
      replace.cancel
    );
  }

  function pushNav(location: LocationComponents): PendingNavigation {
    let keyed = utils.keyed(location, keygen.major(current().key));
    return createNavigation(keyed, "push", push.finish(keyed), push.cancel);
  }

  return {
    prepare,
    emitNavigation,
    createNavigation,
    cancelPending
  };
}
