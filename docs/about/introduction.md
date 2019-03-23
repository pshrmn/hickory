# Introduction to Hickory

Hickory provides a three packages that allow you to easily power navigation within your single-page application. These packages, `@hickory/browser`, `@hickory/hash`, and `@hickory/in-memory`, all share a nearly identical API, but are intended to be used in different environments.

## Creation

At the root of your project, you will create a history object. There are three choices: `Browser`, `Hash`, and `InMemory`. You can read more about how to pick the right one for your application in the [choosing your history type](./choosing.md) documentation. For simplicity, all example code here will use the `Browser` history type.

```js
import Browser from "@hickory/Browser";

const history = Browser(responseHandler, options);
```

When creating a history object, it must be passed a response handler function. This is a function that will be called whenever there is navigation (as well as immediately with the initial location).

Additionally, you may pass an `options` object, which will customize the history object that you are creating. For example, you can pass `parse` and `stringify` options to control the `query` property of your location objects. This allows you to represent queries as objects within your application, but easily convert them to and from strings for URIs. Each type's API documentation includes these possible values.

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

Your history object provides a `navigate()` method to perform navigation. There are three ways that you can use this.

### `PUSH`, `REPLACE`, and `ANCHOR`

`PUSH`, `REPLACE`, and `ANCHOR` all have similar functionality. Each one takes a single argument: the location that you want to navigate to. This can either be a string or an object. If it is a string, it will be parsed and turned into a location object. If it is an object, it will be modified to fill in any missing properties (as well as the `key`).

```js
history.navigate("/do#re", "PUSH");
// {
//   pathname: '/do',
//   query: {},
//   hash: 're',
//   state: null,
//   key: '1.0'
// }

history.navigate({ pathname: "/mi", query: { fa: "so" } }, "REPLACE");
// {
//   pathname: '/mi',
//   query: { fa: 'so' },
//   hash: '',
//   state: null,
//   key: '1.1'
// }

history.navigate({ state: { rest: ["la", "ti", "do"] } }, "ANCHOR");
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

You can imagine the locations that have been visited in your application as an array of location objects. When you `PUSH`, you add a new location after the current location. This means that if you are not at the end of the array, any "future" locations will be wiped out. When you `REPLACE`, you are just replacing the current location object with a new one. This does not affect any "future" locations.

`ANCHOR` combines `PUSH` and `REPLACE` to act more like a browser does. If you attempt to navigate to a location that generates the same URI as the current location, `REPLACE` will be called. If the new location generates a different URI, then `PUSH` will be called.

**Unless you have a specific reason to use `PUSH`/`REPLACE`, you should always navigate to locations with `ANCHOR`.**

### `go`

While the above three methods take locations as their argument, `go` takes a number. This is the number of steps forward (for positive numbers) or back (for negative numbers) that you want to navigate (from the current index).

```js
// { key: '3.0', ... }
history.go(-2);
// { key: '1.0', ... }
```

## One history

If you are running your application in a browser, it is important that you only use one history object. It is fine to have multiple applications on the same page, but they should all use the same history object. If you were to use multiple history objects, then when one triggered navigation, the others would not know that the navigation occurred.
