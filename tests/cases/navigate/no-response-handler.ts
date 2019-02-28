import { TestCaseArgs } from "../../types";

export default {
  msg: "does nothing without a response handler",
  fn: function({ history }: TestCaseArgs) {
    history.navigate("/two");
    expect(history.location.pathname).toBe("/one");
  }
};
