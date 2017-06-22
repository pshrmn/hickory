export function domExists() {
  return window && window.location;
}

/*
 * Ignore popstate events that don't define event.state
 * unless they come from Chrome on iOS (because it emits
 * events where event.state is undefined when you click
 * the back button)
 */
export function ignorablePopstateEvent(event) {
  return (
    event.state === undefined &&
    navigator.userAgent.indexOf('CriOS') === -1
  );
}

/*
 * Fix for IE 10/11 because they do not emit popstate events
 * when the hash changes
 */
export function needToUseHashchangeEvent() {
  return window.navigator.userAgent.indexOf('Trident') !== -1
}

/*
 * IE 11 might throw, so just catch and return empty object when that happens
 */
export function getStateFromHistory() {
  try {
    return window.history.state || {}
  } catch (e) {
    return {}
  }
}
