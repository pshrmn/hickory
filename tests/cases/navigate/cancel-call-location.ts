import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "calling cancel does not update history's location or action",
  fn: function({ history }: TestCaseArgs) {
    let router = ignoreFirstCall(function(pending) {
      expect(history.location.pathname).toBe("/one");
      expect(history.action).toBe("push");
      pending.cancel();
      expect(history.location.pathname).toBe("/one");
      expect(history.action).toBe("push");
    });
    history.respondWith(router);
    history.navigate("/two", "replace");
  }
};
