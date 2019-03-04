import { TestCaseArgs } from "../../types";

export default {
  msg: "throws when given an invalid nav method",
  fn: function({ shell }: TestCaseArgs) {
    const history = shell(pending => {});

    expect(() => {
      // @ts-ignore
      history.navigate("/somewhere", "throws");
    }).toThrowError("Invalid navigation type: throws");
  }
};
