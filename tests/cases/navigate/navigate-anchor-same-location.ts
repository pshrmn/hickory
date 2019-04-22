import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with anchor method replaces for same location",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    const history = constructor(pending => {
      expect(pending.action).toBe("replace");
    }, options);
    history.navigate({ url: "/one" }, "anchor");
  }
};
