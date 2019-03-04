import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "navigate with no method replaces for same location",
  fn: function({ shell }: TestCaseArgs) {
    const history = shell(pending => {
      expect(pending.action).toBe("replace");
    });
    history.navigate("/one");
  }
};
