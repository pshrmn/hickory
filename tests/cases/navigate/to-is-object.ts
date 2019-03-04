import "jest";
import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "works with object locations",
  fn: function({ pendingHistory }: TestCaseArgs) {
    const history = pendingHistory(pending => {
      expect(pending.location).toMatchObject({
        pathname: "/two",
        hash: "test"
      });
    });
    history.navigate({ pathname: "/two", hash: "test" });
  }
};
