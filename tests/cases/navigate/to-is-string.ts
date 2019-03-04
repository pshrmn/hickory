import "jest";
import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "works with string locations",
  fn: function({ shell }: TestCaseArgs) {
    const history = shell(pending => {
      expect(pending.location).toMatchObject({
        pathname: "/two",
        query: "test=ing"
      });
    });
    history.navigate("/two?test=ing");
  }
};
