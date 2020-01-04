# Hickory

[![npm][version-badge]][npm-hickory] [![Travis][build-badge]][build] [![BrowserStack Status][browserstack-badge]][browserstack-build]

A single page application navigation system that works in the browser or in memory.

### Documentation

You can learn about Hickory and read up on the APIs in the [documentation](./docs)

### Inspiration

Hickory is heavily inspired by the [history](https://github.com/ReactTraining/history) package and the `history` modules from [`vue-router`](https://github.com/vuejs/vue-router).

### Packages

This repository is a monorepo for the Hickory packages. Unless you are creating your own customized history type, you only need to know about three of them:

| Package   | Version                                          | Repo                                       | API                            |
| --------- | ------------------------------------------------ | ------------------------------------------ | ------------------------------ |
| browser   | [![npm][browser-version-badge]][npm-browser]     | [packages/browser](./packages/browser)     | [API](./docs/api/browser.md)   |
| hash      | [![npm][hash-version-badge]][npm-hash]           | [packages/hash](./packages/hash)           | [API](./docs/api/hash.md)      |
| in-memory | [![npm][in-memory-version-badge]][npm-in-memory] | [packages/in-memory](./packages/in-memory) | [API](./docs/api/in-memory.md) |

[browser-version-badge]: https://img.shields.io/npm/v/@hickory/browser.svg
[npm-browser]: https://npmjs.com/package/@hickory/browser
[hash-version-badge]: https://img.shields.io/npm/v/@hickory/hash.svg
[npm-hash]: https://npmjs.com/package/@hickory/hash
[in-memory-version-badge]: https://img.shields.io/npm/v/@hickory/in-memory.svg
[npm-in-memory]: https://npmjs.com/package/@hickory/in-memory

### Usage

Below is a quick introduction to the API of a history object.

```js
import { Browser } from "@hickory/browser";

let history = Browser();

// You must add a respond handler function. Whenever there
// is navigation, that function will be called. It is responsible
// for finishing the navigation. "finish" should not be called until
// after any route matching/data loaded has finished running.
history.respondWith(({ location, action, finish, cancel }) => {
  console.log("Navigating to:", location);
  finish();
});

// All of the locations that are visited by the user of your
// application will be stored in an array. An index value is used to keep
// track of which location in the array is the current one.

// There are two navigation methods that you can use to change locations.

// navigate() is used for navigating to a new location.
// It has three modes: "anchor", "push", and "replace".
// "push" pushes the new location onto the session history after the current location
// "replace" replaces the current location in the session history
// "anchor" (default) acts like "push" for new locations and "replace" when the provided location
//   is the same as the current location (the same behavior as clicking an <a>).
// The first argument to navigate() is either a string or a partial location object.
// The optional second argument is the navigation mode ("anchor" if not provided).

// mode = "anchor"
history.navigate("/next-location");
// mode = "push"
history.navigate("/new-location", "push");
// mode = "replace"
history.navigate("/same-location", "replace");

// go() is used to jump to existing locations in the session history.
// negative values go backwards and positive values go forwards

// current index = 4
history.go(-2);
// new index = 2

// You might want to have you users confirm navigation before actually
// switching pages. To do this, pass a confirmation function to the
// confirmWith method.

history.confirmWith(function(info, confirm, prevent) {
  let confirmed = window.confirm("Are you sure you want to navigate?");
  if (confirmed) {
    confirm();
  } else {
    prevent();
  }
});

// Now, whenever there is navigation (the user clicks a link or the browser's
// forward/back buttons), the confirmation function will be run and the
// navigation will be cancelled if the prevent function is called.

// In the above example, if the user clicks the cancel button of the
// "confirm" popup, then the navigation will be cancelled. If the user clicks
// the "OK" button, then the navigation will occur.

// If/when you no longer want the user to have to confirm navigation, just call
// the removeConfirmation function and navigation will always happen.

history.removeConfirmation();
```

### Browser Support

Browser testing is provided thanks to BrowserStack

[<img src='./static/BrowserStackLogo.png' />](https://www.browserstack.com/start)

The following browsers are currently tested:

- Chrome 63 on Windows 10
- Firefox 57 on Windows 10
- Internet Explorer 11 on Windows 10
- Edge 16 on Windows 10
- Safari 12 on macOS Mojave
  <!--* Safari on iOS 10.3
- Chrome on Android 4.4-->

[version-badge]: https://img.shields.io/npm/v/hickory.svg
[npm-hickory]: https://npmjs.com/package/hickory
[build-badge]: https://img.shields.io/travis/pshrmn/hickory/master.svg
[build]: https://travis-ci.org/pshrmn/hickory
[browserstack-badge]: https://www.browserstack.com/automate/badge.svg?badge_key=bHVBTk00Sm9ucnJ5SDlaOE5MZW80R214K0F3ZlkwVlY5OHd1WjI0OWJaQT0tLVYra3dYSUVOOTlKTnJHZUdDSXZHbVE9PQ==--50fa09de197425afca33b06f04e61e7582f13259
[browserstack-build]: https://www.browserstack.com/automate/public-build/bHVBTk00Sm9ucnJ5SDlaOE5MZW80R214K0F3ZlkwVlY5OHd1WjI0OWJaQT0tLVYra3dYSUVOOTlKTnJHZUdDSXZHbVE9PQ==--50fa09de197425afca33b06f04e61e7582f13259
