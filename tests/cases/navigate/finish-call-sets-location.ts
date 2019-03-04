import { TestCaseArgs } from "../../types";

// should this be an integration test?
export default {
  msg: "updates history's location when finish function is called",
  fn: function({ pendingHistory }: TestCaseArgs) {
    const history = pendingHistory(pending => {
      expect(history.location.pathname).toBe("/one");
      pending.finish();
      expect(history.location.pathname).toBe("/two");
    });
    history.navigate("/two");
  }
};
