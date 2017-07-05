export default function eventCoordinator(events) {
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
