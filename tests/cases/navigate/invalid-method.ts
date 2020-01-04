import { TestCaseArgs } from "../../types";

export default {
  msg: "throws when given an invalid nav method",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    let history = constructor(pending => {}, options);

    expect(() => {
      // @ts-ignore
      history.navigate({ url: "/somewhere" }, "throws");
    }).toThrowError("Invalid navigation type: throws");
  }
};
