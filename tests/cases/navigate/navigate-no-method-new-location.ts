import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with no method pushes for new locations",
  fn: function({ history }: TestCaseArgs) {
    const router = ignoreFirstCall(({ action }) => {
      expect(action).toBe("push");
    });
    history.respondWith(router);

    history.navigate("/two");
  }
};
