import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with anchor method replaces for same location",
  fn: function({ shell }: TestCaseArgs) {
    const history = shell(pending => {
      expect(pending.action).toBe("replace");
    });
    history.navigate("/one", "anchor");
  }
};
