import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

// should this be an integration test?
export default {
  msg: "updates history's location when finish function is called",
  fn: function({ history }: TestCaseArgs) {
    const router = ignoreFirstCall(function(pending) {
      expect(history.location.pathname).toBe("/one");
      pending.finish();
      expect(history.location.pathname).toBe("/two");
    });
    history.respondWith(router);
    history.navigate("/two");
  }
};
