import "jest";
import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { TestCaseArgs } from "../../types";

export default {
  msg: "works with object locations",
  fn: function({ history }: TestCaseArgs) {
    const router = ignoreFirstCall(function(pending) {
      expect(pending.location).toMatchObject({
        pathname: "/two",
        hash: "test"
      });
    });
    history.respondWith(router);
    history.navigate({ pathname: "/two", hash: "test" });
  }
};
