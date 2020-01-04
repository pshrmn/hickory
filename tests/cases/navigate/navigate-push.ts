import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with push method pushes",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    let history = constructor(pending => {
      expect(pending.action).toBe("push");
    }, options);
    history.navigate({ url: "/two" }, "push");
  }
};
