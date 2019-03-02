import { ResponseHandler, PendingNavigation, Action } from "./types/navigation";

export default function responder() {
  let responseHandler: ResponseHandler | undefined;
  let pending: PendingNavigation | undefined;

  function emitNavigation(nav: PendingNavigation) {
    if (!responseHandler) {
      return;
    }
    pending = nav;
    responseHandler(nav);
  }

  function clearPending() {
    if (pending) {
      pending = undefined;
    }
  }

  function cancelPending(action?: Action) {
    if (pending) {
      pending.cancelled = true;
      pending.cancel(action);
      pending = undefined;
    }
  }

  function setHandler(fn: ResponseHandler) {
    responseHandler = fn;
  }

  return {
    emitNavigation,
    clearPending,
    cancelPending,
    setHandler
  };
}
