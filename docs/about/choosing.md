# Choosing your history type

There are three history packages that `hickory` provides: `@hickory/browser`, `@hickory/hash`, and `@hickory/in-memory`. You only need to install the one that you need for your application.

The fastest way to determine which history type to use is via this flow chart:

<img src='../../static/Choose-A-Type.png' />

To get a better understanding of why each works the way it does, please read on.

Each type of history has the same core functionality. The differences lie largely in 1. how the history is stored and 2. how a location is represented as a path.

## Browser

```sh
npm install @hickory/browser
```

The browser history relies on the user's browser to handle keeping track of locations. It uses the [`window.history`](https://developer.mozilla.org/en-US/docs/Web/API/Window/history) API to update the internal list of visited locations. It also uses an event listener to detect navigation triggered outside of your application (e.g. the user pressing the browser's forward/back buttons).

Whenever the browser history needs to create a location from the browser, it uses the `pathname`, `search`, and `hash` properties from `window.location` to create a path string. It then parses that string to create a location object. The parsing step is important because it will parse the search value to create the correct `query` value for your application. Parsing will also strip the `base_segment` off of the `pathname` (if you are using that feature).

```js
// the following window.location
window.location = {
  pathname: '/the-page',
  search: '?one=uno',
  hash: ''
}
// can create the location object (if you provide
// a query parsing function)
location = {
  pathname: '/the-page',
  query: { one: 'uno' },
  hash: '',
  ...
}
```

Generally speaking, if you are running your application in a browser, you will want to use the browser history. However, whether or not you _can_ use it depends on the server that is serving your application. If you can configure your server to respond to any possible pathname request, then you can use the `browser` history. However, if your application is hosted on a static file server, then you will have to use the `hash` history.

### Setting up your server to support browser history.

How do you make your server capable of working with the browser history? There is no one correct solution and this will vary based on what your server is. The basic idea for all of the, however, is the same. You will want a catch-all request handler (somewhere after you have defined your static file handler) that will always respond with your `index.html` file. That `index.html` file will have a `<script>` tag that downloads your application's JavaScript files and gets your application running.

A simple example of this can be demonstrated with Express:

```js
const express = require("express");

const app = express();

// we want to catch any requests for static files and
// actually serve those files
app.use("/static", express.static(__dirname, "/public/"));

// all other requests will just server our index.html file
app.get("*", function(request, response) {
  response.sendFile("./index.html");
});
```

## Hash

```sh
npm install @hickory/hash
```

The hash history is nearly identical to the browser history. The only difference is how location objects are created from the URI and how location objects are transformed into path strings that are pushed to the browser.

As stated above, the hash history is what you need to use if you are using a static file server. Why is this? When you enter a URI into your browser, a request is sent off to the website's server, and it attempts to match the requested URI's pathname to a resource on the server. For dynamic servers, this does not have to correspond to an actual file. Instead, the server just has to recognize the path and serve some HTML that corresponds to the requested pathname. However, on a static file server, each requested resource actually has to exist. That means that if a user attempts to visit `https://example.com/about/`, then that server better have an `/about` folder that contains an `index.html` file. If it does not, then it will serve a 404 error.

Now, in theory you could create a file on your server for every valid route in your application, but that would 1. quickly become unfeasible (especially if you want to have path parameters) and 2. defeat the purpose of having a single-page application. Instead, what you want is for every route in your application to request the same resource from the server. The way to do this is to remove your application's routing to the `hash` segment of the URI. This works because the hash is not used for resource identification, only the pathname is. That means that `https://example.com/#/` and `https://example.com/#/some-other-page` both request the same resource from the server (the `index.html` in the root folder).

## In-Memory

```sh
npm install @hickory/in-memory
```

```js
import { in_memory } from "@hickory/in-memory";

const history = in_memory(responseHandler);
```

The in-memory history does not have a browser to rely on to keep track of visited locations, so it does this itself. This is done by storing visited locations in an array and keeping an index value to track the current position. This mimics the behavior of a browser, but the code can be run anywhere. This makes in-memory a great choice if you are doing server side rendering for an application, testing out some code that needs to be location-aware, or running in a mobile application. The in-memory history could also be used in a browser if you have an application that needs to perform navigation, but you don't want it to affect the URI.

There is a small amount of additional functionality that the in-memory history provides. When creating an in-memory history, you can pass initial locations and the initial index. This can be helpful for restoring a session. You are also able to directly access these values as the `locations` and `index` properties of the history object.

```js
const history = in_memory(responseHandler, {
  locations: ["/one", "/two", { pathname: "/three" }],
  index: 2
});
// history.location = { pathname: '/three' }
```
