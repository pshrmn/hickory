import { TestCaseArgs } from "../../types";

export default {
  msg: "calling cancel maintains current location",
  fn: function({ pendingHistory }: TestCaseArgs) {
    const history = pendingHistory(pending => {
      expect(history.location.pathname).toBe("/one");
      pending.cancel();
      expect(history.location.pathname).toBe("/one");
    });
    history.navigate("/two", "replace");
  }
};
