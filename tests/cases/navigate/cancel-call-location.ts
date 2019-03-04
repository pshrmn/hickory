import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "calling cancel maintains current location",
  fn: function({ shell }: TestCaseArgs) {
    const history = shell(pending => {
      expect(history.location.pathname).toBe("/one");
      pending.cancel();
      expect(history.location.pathname).toBe("/one");
    });
    history.navigate("/two", "replace");
  }
};
