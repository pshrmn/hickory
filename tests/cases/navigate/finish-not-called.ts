import { TestCaseArgs } from "../../types";

export default {
  msg: "does nothing if pending.finish() is not called",
  fn: function({ pendingHistory }: TestCaseArgs) {
    const history = pendingHistory(pending => {});
    history.navigate("/two");
    expect(history.location.pathname).toBe("/one");
  }
};
