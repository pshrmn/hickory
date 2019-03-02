import { ResponseHandler, PendingNavigation, Action } from "./types/navigation";

export default function navigationHandler() {
  let responseHandler: ResponseHandler | undefined;
  let pending: PendingNavigation | undefined;

  function emitNavigation(nav: PendingNavigation) {
    if (!responseHandler) {
      return;
    }
    const { location, action, finish, cancel } = nav;
    const wrappedNav = {
      location,
      action,
      finish() {
        if (
          wrappedNav.cancelled ||
          pending === undefined ||
          pending !== wrappedNav
        ) {
          return;
        }
        finish();
        pending = undefined;
      },
      cancel(nextAction?: Action) {
        if (
          wrappedNav.cancelled ||
          pending === undefined ||
          pending !== wrappedNav
        ) {
          return;
        }
        cancel(nextAction);
        pending.cancelled = true;
        pending = undefined;
      },
      cancelled: false
    };
    pending = wrappedNav;
    responseHandler(wrappedNav);
  }

  function cancelPending(action?: Action) {
    if (pending) {
      pending.cancel(action);
      pending = undefined;
    }
  }

  function setHandler(fn: ResponseHandler) {
    responseHandler = fn;
  }

  return {
    emitNavigation,
    cancelPending,
    setHandler
  };
}
