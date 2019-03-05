import { TestCaseArgs } from "../../types";

export default {
  msg: "throws when given an invalid nav method",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    const history = constructor(pending => {}, options);

    expect(() => {
      // @ts-ignore
      history.navigate("/somewhere", "throws");
    }).toThrowError("Invalid navigation type: throws");
  }
};
