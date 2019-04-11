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

export default function navigateWith(args: NavigateArgs): NavigateHelpers {
  const { responseHandler, utils, keygen, current, push, replace } = args;
  let pending: PendingNavigation | undefined;

  function createNavigation(
    location: SessionLocation,
    action: Action,
    finish: FinishNavigation,
    cancel: CancelNavigation
  ): PendingNavigation {
    const navigation = {
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

  function prepare(to: ToArgument, navType: NavType) {
    const location = utils.location(to);
    switch (navType) {
      case "anchor":
        return utils.stringify(location) === utils.stringify(current())
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
    const keyed = utils.keyed(location, keygen.minor(current().key));
    return createNavigation(
      keyed,
      "replace",
      replace.finish(keyed),
      replace.cancel
    );
  }

  function pushNav(location: LocationComponents): PendingNavigation {
    const keyed = utils.keyed(location, keygen.major(current().key));
    return createNavigation(keyed, "push", push.finish(keyed), push.cancel);
  }

  return {
    prepare,
    emitNavigation,
    createNavigation,
    cancelPending
  };
}
