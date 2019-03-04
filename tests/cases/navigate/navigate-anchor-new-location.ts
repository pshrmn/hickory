import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with anchor method pushes for new locations",
  fn: function({ shell }: TestCaseArgs) {
    const history = shell(pending => {
      expect(pending.action).toBe("push");
    });
    history.navigate("/two", "anchor");
  }
};
