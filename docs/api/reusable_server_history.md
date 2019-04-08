# Server-Side Rendering API

With server-side rendering, a history object only needs to support limited functionality. It needs to be able to create and stringify locations, but there is no need for navigation.

A new history object is created for every render. Once a render is completed, the history object is thrown away.

While the `in_memory` history could work, it is also more expensive than is necessary because it creates a full history object.

The `reusable_server_history` function is used to create a lightweight history function. In your module, you will call `reusable_server_history` in the global scope. The function call returns a history constructor, which is used to create a history instance. This will save you from having to re-create the object creation/stringifying functions for every new render.

```js
import { reusable_server_history } from "@hickory/in-memory";

const server_history = reusable_server_history();

function handler(req, res) {
  const history = server_history({ location: req.url });
}
```
