export function dom_exists(): boolean {
  return !!(window && window.location);
}

/*
 * Ignore popstate events that don't define event.state
 * unless they come from Chrome on iOS (because it emits
 * events where event.state is undefined when you click
 * the back button)
 */
export function ignorable_popstate_event(event: PopStateEvent) {
  return (
    event.state === undefined && navigator.userAgent.indexOf("CriOS") === -1
  );
}

/*
 * IE 11 might throw, so just catch and return empty object when that happens
 */
export function get_state_from_history() {
  try {
    return window.history.state || {};
  } catch (e) {
    return {};
  }
}
