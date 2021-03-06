# Server-Side Rendering API

With server-side rendering, a history object only needs to support limited functionality. It needs to be able to create and stringify locations, but there is no need for navigation.

A new history object is created for every render. Once a render is completed, the history object is thrown away.

While the `inMemory` history could work, it is also more expensive than is necessary because it creates a full history object.

The `createReusable` function is used to create a lightweight history function. In your module, you will call `createReusable` in the global scope. The function call returns a history constructor, which is used to create a history instance. This will save you from having to re-create the object creation/stringifying functions for every new render.

```js
import { createReusable } from "@hickory/in-memory";

let reusable = createReusable();

function handler(req, res) {
  let history = reusable({
    location: { url: req.url }
  });
}
```
