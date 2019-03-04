import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with push method pushes",
  fn: function({ pendingHistory }: TestCaseArgs) {
    const history = pendingHistory(pending => {
      expect(pending.action).toBe("push");
    });
    history.navigate("/two", "push");
  }
};
