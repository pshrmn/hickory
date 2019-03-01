import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with no method replaces for same location",
  fn: function({ history }: TestCaseArgs) {
    const router = ignoreFirstCall(({ action }) => {
      expect(action).toBe("replace");
    });
    history.respondWith(router);

    history.navigate("/one");
  }
};
