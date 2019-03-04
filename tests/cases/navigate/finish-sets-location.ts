import { TestCaseArgs } from "../../types";

export default {
  msg: "calling pending.finish() sets history's location",
  fn: function({ shell }: TestCaseArgs) {
    const history = shell(pending => {
      pending.finish();
    });
    history.navigate("/next");
    expect(history.location).toMatchObject({
      pathname: "/next"
    });
  }
};
