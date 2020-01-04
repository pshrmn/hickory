import { TestCaseArgs } from "../../types";

export default {
  msg: "calling pending.finish() sets history's location",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    let history = constructor(pending => {
      pending.finish();
    }, options);
    history.navigate({ url: "/next" });
    expect(history.location).toMatchObject({
      pathname: "/next"
    });
  }
};
