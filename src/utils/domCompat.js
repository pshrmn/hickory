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
 * Need to detect some old Android stock browsers because their
 * History implementation is buggy
 */
export function canUseWindowHistory() {
  const ua = window.navigator.userAgent

  if ((ua.indexOf('Android 2.') !== -1 ||
      (ua.indexOf('Android 4.0') !== -1)) &&
      ua.indexOf('Mobile Safari') !== -1 &&
      ua.indexOf('Chrome') === -1 &&
      ua.indexOf('Windows Phone') === -1 &&
      location.protocol !== 'file:'
  ) {
    return false;
  }

  return window.history && 'pushState' in window.history
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
