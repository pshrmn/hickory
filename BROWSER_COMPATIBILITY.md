# List of known browser issues

These are mostly gleaned from bug fixes in the `history` package.

1.  Internet Explorer 10/11 do not emit `popstate` events when only the `hash` segment of the URI changes. In order to deal with that, we need to detect those browsers and also add `hashchange` listeners.

2.  Internet Explorer 11 will sometimes throw errors when attempting to access `window.history.state`. In order to deal with that, we need to wrap access to that in a `try...catch` and just return an empty object when that happens.

3.  In Webkit browsers, there can be extra `popstate` events that we want to ignore. To deal with this, we can ignore these events when `event.state` is `undefined` (unless we are in Chrome on iOS).
