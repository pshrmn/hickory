# Hickory

[![npm][version-badge]][npm-hickory] [![Travis][build-badge]][build] [![BrowserStack Status][browserstack-badge]][browserstack-build]

A single page application navigation system that works in the browser or in memory.

### Documentation

You can learn about Hickory and read up on the APIs in the [documentation](./docs)

### Inspiration

Hickory is heavily inspired by the [history](https://github.com/ReactTraining/history) package and the `history` modules from [`vue-router`](https://github.com/vuejs/vue-router).

### Packages

This repository is a monorepo for the Hickory packages. Unless you are creating your own customized history type, you only need to know about three of them:

| Package | Version | Repo | API |
|---|---|---|---|
| browser | [![npm][browser-version-badge]][npm-browser] | [packages/browser](./packages/browser) | [API](./docs/api/Browser.md) |
| hash | [![npm][hash-version-badge]][npm-hash] | [packages/hash](./packages/hash) | [API](./docs/api/Hash.md) |
| in-memory | [![npm][in-memory-version-badge]][npm-in-memory] | [packages/in-memory](./packages/in-memory) | [API](./docs/api/InMemory.md) |

[browser-version-badge]: https://img.shields.io/npm/v/@hickory/browser.svg
[npm-browser]: https://npmjs.com/package/@hickory/browser

[hash-version-badge]: https://img.shields.io/npm/v/@hickory/hash.svg
[npm-hash]: https://npmjs.com/package/@hickory/hash

[in-memory-version-badge]: https://img.shields.io/npm/v/@hickory/in-memory.svg
[npm-in-memory]: https://npmjs.com/package/@hickory/in-memory


### Usage

Below is a quick introduction to the API of a history object.

```js
import Browser from '@hickory/browser';

const history = Browser();

// You can add a subscription function to the history, and whenever there
// is navigation, that function will be called.
history.subscribe((location, action) => {
  console.log('Navigated to:', location);
});

// All of the locations that are visited by the user of your
// application will be stored in an array. An index value is used to keep
// track of which location in the array is the current one.

// There are four navigation methods that you can use to change locations.

// push adds a new location to the locations array. If you are not
// currently at the end of the array, then all locations after the
// current location will be lost

history.push('/next-location');

// replace swaps the new location in place of the current location

history.push('/same-location');

// update will determine whether it should push or replace by comparing
// the path it is navigating to to the current path. If they are the
// same, then it will use replace and if they are different it will use push

// current path = '/here'
history.update('/here'); // replace
history.update('/somewhere-else'); // push

// go takes a number and adds that value to the current index to get the
// new index

// current index = 4

history.go(-2); // new index = 2

// You might want to have you users confirm navigation before actually
// switching pages. To do this, pass a confirmation function to the
// confirmWith method.

history.confirmWith(function(info, confirm, prevent) {
  const confirmed = window.confirm('Are you sure you want to navigate?');
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

* Chrome 57 on Windows 10
* Firefox 53 on Windows 10
* Internet Explorer 11 on Windows 10
* Edge 13 on Windows 10
* Safari 10 on macOS Sierra
* Safari on iOS 10.3
* Chrome on Android 4.4

[version-badge]: https://img.shields.io/npm/v/hickory.svg
[npm-hickory]: https://npmjs.com/package/hickory

[build-badge]: https://img.shields.io/travis/pshrmn/hickory/master.svg
[build]: https://travis-ci.org/pshrmn/hickory

[browserstack-badge]: https://www.browserstack.com/automate/badge.svg?badge_key=bHVBTk00Sm9ucnJ5SDlaOE5MZW80R214K0F3ZlkwVlY5OHd1WjI0OWJaQT0tLVYra3dYSUVOOTlKTnJHZUdDSXZHbVE9PQ==--50fa09de197425afca33b06f04e61e7582f13259
[browserstack-build]: https://www.browserstack.com/automate/public-build/bHVBTk00Sm9ucnJ5SDlaOE5MZW80R214K0F3ZlkwVlY5OHd1WjI0OWJaQT0tLVYra3dYSUVOOTlKTnJHZUdDSXZHbVE9PQ==--50fa09de197425afca33b06f04e61e7582f13259
