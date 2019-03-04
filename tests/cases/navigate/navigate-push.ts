import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with push method pushes",
  fn: function({ shell }: TestCaseArgs) {
    const history = shell(pending => {
      expect(pending.action).toBe("push");
    });
    history.navigate("/two", "push");
  }
};
