import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with push method pushes",
  fn: function({ history }: TestCaseArgs) {
    const router = ignoreFirstCall(({ action }) => {
      expect(action).toBe("push");
    });
    history.respondWith(router);

    history.navigate("/two", "push");
  }
};
