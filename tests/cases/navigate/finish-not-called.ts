import { TestCaseArgs } from "../../types";

export default {
  msg: "does nothing if pending.finish() is not called",
  fn: function({ shell }: TestCaseArgs) {
    const history = shell(pending => {});
    history.navigate("/two");
    expect(history.location.pathname).toBe("/one");
  }
};
