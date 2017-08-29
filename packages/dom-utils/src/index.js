export function ensureEncodedPathname(pathname) {
	const a = document.createElement('a');
	a.setAttribute('href', pathname);
	return a.pathname;
}

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
 * IE 11 might throw, so just catch and return empty object when that happens
 */
export function getStateFromHistory() {
  try {
    return window.history.state || {}
  } catch (e) {
    return {}
  }
}

export function createEventCoordinator(events) {
  for (let event in events) {
    let fn = events[event];
    if (fn) {
      window.addEventListener(event, fn, false);
    }
  }

  return function destroyEvents() {
    for (let event in events) {
      let fn = events[event];
      if (fn) {
        window.removeEventListener(event, fn, false);
      }
    }
  }
}
