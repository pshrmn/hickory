function noop() {}

export default function createNavigationConfirmation() {

  let confirmFunction;

  function confirmNavigation(location, action, success, failure = noop) {
    if (!confirmFunction) {
      success();
    } else {
      confirmFunction(location, action, success, failure);
    }
  }

  function confirmWith(fn) {
    if (typeof fn !== 'function') {
      return;
    }
    confirmFunction = fn;
  };

  function removeConfirmation() {
    confirmFunction = null;
  };

  return {
    confirmNavigation,
    confirmWith,
    removeConfirmation
  }
}
