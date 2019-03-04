import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with replace method replaces",
  fn: function({ pendingHistory }: TestCaseArgs) {
    const history = pendingHistory(pending => {
      expect(pending.action).toBe("replace");
    });
    history.navigate("/two", "replace");
  }
};
