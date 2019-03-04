import "jest";

import { TestCaseArgs } from "../../types";

export default {
  msg: "works with string locations",
  fn: function({ pendingHistory }: TestCaseArgs) {
    const history = pendingHistory(pending => {
      expect(pending.location).toMatchObject({
        pathname: "/two",
        query: "test=ing"
      });
    });
    history.navigate("/two?test=ing");
  }
};
