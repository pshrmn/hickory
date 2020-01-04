import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with replace method replaces",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    let history = constructor(pending => {
      expect(pending.action).toBe("replace");
    }, options);
    history.navigate({ url: "/two" }, "replace");
  }
};
