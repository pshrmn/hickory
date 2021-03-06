import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with anchor method pushes for new locations",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    let history = constructor(pending => {
      expect(pending.action).toBe("push");
    }, options);
    history.navigate({ url: "/two" }, "anchor");
  }
};
