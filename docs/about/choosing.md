# Choosing your history type

There are three history types that `hickory` provides: `Browser`, `Hash`, and `InMemory`.

The fastest way to determine which history type to use is via this flow chart:

<img src='../../static/Choose-A-Type.png' />

To get a better understanding of why each works the way it does, please read on.

The first question to ask yourself is "Where is my application running?". If the answer is not "in a browser", then you need to use the `InMemory` history.

## `InMemory`

```js
import { InMemory } from 'hickory';

const history = InMemory();
```

The `InMemory` history keeps track of its own list of visited locations. It does this simply by storing them in an array and keeping an index value to track the current position. This mimics the behavior of a browser, but the code can be run anywhere. This makes `InMemory` a great choice if you are doing server side rendering for an application, testing out some code that needs to be location-aware, or running in a mobile application.

When creating an `InMemory` history, you can pass initial locations and the initial index. This can be helpful for restoring a session.

```js
const history = InMemory({
  locations: [
    '/one',
    '/two',
    { pathname: '/three' }
  ],
  index: 2
});
// history.location = { pathname: '/three' }
```

## `Browser` or `Hash`

If the answer to the first question was "in a browser", then you have to determine whether to use a `Browser` or a `Hash` history. Functionally, the two are identical. Both have the same methods and respond to the same browser actions. The difference between the two is how they translate locations into URIs (and vice versa). Generally speaking, you almost always will want to use `Browser`. However, this is not always possible.

When a browser history creates a location from the current URI, it looks at the current `window.location` object's `pathname`, `search`, and `hash` strings. Those are concatenated together and the result is parsed to create a location object. When a hash history creates a loaction from the current URI, it only looks at `window.location.hash`. An obvious effect of this is that the `Hash` history has uglier URIs:

```js
import { Browser, Hash } from 'hickory';

const browser = Browser();
const hash = Hash();

const location = {
  pathname: '/check-me-out'
};

browser.push(location);
// http://example.com/check-me-out

hash.push(location);
// https://example.com/#/check-me-out

```

So why would you ever want to use `Hash`? `Hash` is the only reasonable option when you are hosting your application on a static file server. 

For example, imagine that you have a simple website with three routes: `/`, `/about`, and `/contact`. If you have a dynamic server, your website can match requests for those paths and respond with your application. For any requests to routes that do not exist, your server can recover and still respond with your application (which would detect that the current URI is a bad route and render accordingly).

However, when you are using a file server, the requested file must exist. That means that if a user requests `https://example.com/`, your server needs to have an `index.html` file in the root directory. If the user requests `https://example.com/about`, then you better also have an `about` folder that contains its own `index.html` file. Any requests for files that do not exist will result in 404 responses and your application will fail to load.

The best way to deal with this is to only have one valid route **on the server**, ideally the root `index.html`. All requests will then be made for that resource. How can you do that while still having any route that you want for your application? Encode the "real" location in the URI's `hash`. The hash segment of the URI is not used for requesting resources, so the server will only see your request for the application. Once your application has loaded, your `Hash` history will parse `window.location.hash` to determine the "real" location.

```js
// https://example.com/#/about
// requests /index.html
// creates location { pathname: '/about' }

// https://example.com/#/contact 
// requests /index.html
// creates location { pathname: '/contact' }
```

As stated before, if you use this, you will end up with uglier URIs. Of course, if you are using a static file server, this is the best option you have. In theory, you could create a file on your server for every single valid route, but this would 1. quickly become cumbersome and 2. still fail for bad routes.

### Setting up your server to support `Browser` history.

So how do you make your server capable of working with the `Browser` history? There is no one correct solution and this will vary based on what your server is. The basic idea for all of the, however, is the same. You will want a catch-all request handler (somewhere after you have defined your static file handler) that will always respond with your `index.html` file. That `index.html` file will have a `<script>` tag that downloads your application's JavaScript files and gets your application running.

A simple example of this can be demonstrated with Express:

```js
const express = require('express');

const app = express();

// we want to catch any requests for static files and
// actually serve those files
app.use('/static', express.static(__dirname, '/public/'));

// all other requests will just server our index.html file
app.get('*', function(request, response) {
  response.sendFile('./index.html');
});
```
