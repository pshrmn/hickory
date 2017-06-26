function noop() {}

export default function createNavigationConfirmation() {

  let confirmFunction;

  function confirmNavigation(info, confirm, prevent = noop) {
    if (!confirmFunction) {
      confirm();
    } else {
      confirmFunction(info, confirm, prevent);
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
