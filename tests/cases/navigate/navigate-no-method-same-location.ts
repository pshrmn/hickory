import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with no method replaces for same location",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    let history = constructor(pending => {
      expect(pending.action).toBe("replace");
    }, options);
    history.navigate({ url: "/one" });
  }
};
