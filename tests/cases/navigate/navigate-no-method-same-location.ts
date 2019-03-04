import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with no method replaces for same location",
  fn: function({ pendingHistory }: TestCaseArgs) {
    const history = pendingHistory(pending => {
      expect(pending.action).toBe("replace");
    });
    history.navigate("/one");
  }
};
