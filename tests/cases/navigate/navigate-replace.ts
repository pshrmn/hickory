import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with replace method replaces",
  fn: function({ history }: TestCaseArgs) {
    const router = ignoreFirstCall(({ action }) => {
      expect(action).toBe("replace");
    });
    history.respondWith(router);

    history.navigate("/two", "replace");
  }
};
