import { TestCaseArgs } from "../../types";

export default {
  msg: "throws when given an invalid nav method",
  fn: function({ pendingHistory }: TestCaseArgs) {
    const history = pendingHistory(pending => {});

    expect(() => {
      // @ts-ignore
      history.navigate("/somewhere", "throws");
    }).toThrowError("Invalid navigation type: throws");
  }
};
