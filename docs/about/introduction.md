# Introduction to Hickory

Hickory provides a three packages that allow you to easily power navigation within your single-page application. These packages, `@hickory/browser`, `@hickory/hash`, and `@hickory/in-memory`, all share a nearly identical API, but are intended to be used in different environments.

## Creation

At the root of your project, you will create a history object. There are three choices: `Browser`, `Hash`, and `InMemory`. You can read more about how to pick the right one for your application in the [choosing your history type](./choosing.md) documentation. For simplicity, all example code here will use the `Browser` history type.

```js
import Browser from '@hickory/Browser';

const history = Browser();
```

Each type can be passed an `options` object, which will customize the history object that you are creating. For example, you can pass `parse` and `stringify` options to control the `query` property of your location objects. This allows you to represent queries as objects within your application, but easily convert them to and from strings for URIs. Each type's API documentation includes these possible values.

## Locations

Location objects are at the core of how history object works. These are objects with a number of properties. Some of these (`pathname`, `query`, and `hash`) can be mapped to a string and used to generate the URI for a location. Others (`state` and `key`) are used for attaching additional information to a location. Location objects are similar to the [`window.location`](https://developer.mozilla.org/en-US/docs/Web/API/Window/location) available in your browser, but make a few deviations for convenience.

```js
{
  pathname: '/who-is-the-walrus',
  query: { rank: 'Sergeant', surname: 'Pepper' },
  hash: 'coo-coo-ca-choo',
  state: { band: 'The Beatles' },
  key: '6.0'
}
```

### pathname

The `pathname` property is an **absolute** string representing a location in your application.

### query

The `query` property in theory can be anything that you want it to be. The only important thing is that if it isn't a string, you provide parse/stringify properties when you create your history object so that hickory can convert the query to a string when generating URIs and from a string to whatever you want it to be when it parses the URI from the browser.

If you stick with the basic string representation, one thing to note is that the question mark (?) at the beginning of the query string will have been stripped off.

### hash

The `hash` property will be mapped to the hash fragment of the URI. Similar to the query property, the pound sign (#) is stripped from the beginning of the hash string.

### state

The `state` property allows you to attach data to location. One thing to be aware of is taht the state will persist across page loads, so this should not be used for anything you want to disappear if the user reloads the page.

### key

The `key` property will be generated for you. If you attempt to provide your own, it will be overwritten. The key is used to identify a location, which is helpful when the user uses the browser's forward/back buttons to navigate. The key property of locations in your application are always incremented. This allows you to determine the "direction" of navigation when transitioning between two locations.

The key is made up of two numbers separated by a period. The first number is the location's position among all locations. The second one is incremented whenever you replace the current location (history.replace).

## Navigation

Your history object will have a number of methods that allow you to navigate within your application.

### `push`, `replace`, and `update`

`push`, `replace`, and `update` all have similar functionality. Each one takes a single argument: the location that you want to navigate to. This can either be a string or an object. If it is a string, it will be parsed and turned into a location object. If it is an object, it will be modified to fill in any missing properties (as well as the `key`).

```js
history.push('/do#re');
// {
//   pathname: '/do',
//   query: {},
//   hash: 're',
//   state: null,
//   key: '1.0'
// }

history.replace({ pathname: '/mi', query: { fa: 'so' }});
// {
//   pathname: '/mi',
//   query: { fa: 'so' },
//   hash: '',
//   state: null,
//   key: '1.1'
// }

history.update({ state: { rest: ['la', 'ti', 'do'] }})
// {
//   pathname: '/',
//   query: {},
//   hash: '',
//   state: { rest: ['la', 'ti', 'do'] },
//   key: '2.0'
// }
```

**Note** If you want to use `state`, you have to provide an object instead of a string.

#### Differences

You can imagine the locations that have been visited in your application as an array of location objects. When you `push`, you add a new location after the current location. This means that if you are not at the end of the array, any "future" locations will be wiped out. When you `replace`, you are just replacing the current location object with a new one. This does not affect any "future" locations.

`update` combines `push` and `replace` to act more like a browser does. If you attempt to navigate to a location that generates the same URI as the current location, `replace` will be called. If the new location generates a different URI, then `push` will be called.

**Unless you have a specific reason to use `push`/`replace`, you should always navigate to locations with `update`.**

### `go`

While the above three methods take locations as their argument, `go` takes a number. This is the number of steps forward (for positive numbers) or back (for negative numbers) that you want to navigate (from the current index).

```js
// { key: '3.0', ... }
history.go(-2);
// { key: '1.0', ... }
```

## Detecting Navigation

Triggering navigation does not do a whole lot if your application does not know that the navigation happened. Hickory expects to be paired with a router, which is added using your history instance's `respondWith` method. Whenever a location change happens, your Hickory history object will call the function passed to `respondWith`. That function call will be passed a "pending navigation" object, which contains the new `location` object, the navigation's `action` type, a `finish` function, and a `cancel` function. Once the router has finished performing any initialization for the new location (e.g. fetching data from your server based on a param from the location), the `finish` function should be called. That will finalize the navigation (e.g. in a browser, it will update the URI displayed in the address bar). If another location change occurs prior to the previous one finishing, that previous location change's `cancel` method should be called. This allows Hickory to prevent unnecessary entries in the history array of locations.

```js
history.respondWith(function(pending) {
  // do any route matching/data loading, and once that
  // is done, call finish.
  pending.finish();
})
```

## One history

If you are running your application in a browser, it is important that you only use one history object. It is fine to have multiple applications on the same page, but they should all use the same history object. If you were to use multiple history objects, then when one triggered navigation, the others would not know that the navigation occurred.
