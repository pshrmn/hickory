import "jest";
import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "works with string locations",
  fn: function({ history }: TestCaseArgs) {
    const router = ignoreFirstCall(function(pending) {
      expect(pending.location).toMatchObject({
        pathname: "/two",
        query: "test=ing"
      });
    });
    history.respondWith(router);
    history.navigate("/two?test=ing");
  }
};
