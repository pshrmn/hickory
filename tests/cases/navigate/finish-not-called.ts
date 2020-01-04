import { TestCaseArgs } from "../../types";

export default {
  msg: "does nothing if pending.finish() is not called",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    let history = constructor(pending => {}, options);
    history.navigate({ url: "/two" });
    expect(history.location.pathname).toBe("/one");
  }
};
