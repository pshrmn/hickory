import { TestCaseArgs } from "../../types";

export default {
  msg: "calling cancel maintains current location",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    let history = constructor(pending => {
      expect(history.location.pathname).toBe("/one");
      pending.cancel();
      expect(history.location.pathname).toBe("/one");
    }, options);
    history.navigate({ url: "/two" }, "replace");
  }
};
