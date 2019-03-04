import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with no method pushes for new locations",
  fn: function({ pendingHistory }: TestCaseArgs) {
    const history = pendingHistory(pending => {
      expect(pending.action).toBe("push");
    });
    history.navigate("/two");
  }
};
