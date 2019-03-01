import "jest";
import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: "finishing pop sets action and location",
  async: true,
  fn: function({ history, resolve }: AsyncTestCaseArgs) {
    expect(history.action).toBe("push");
    let setup = true;
    const router = ignoreFirstCall(function(pending) {
      pending.finish();
      if (setup) {
        return;
      }
      expect(history.action).toBe("pop");
      expect(history.location).toMatchObject({
        pathname: "/one"
      });
      resolve();
    });
    history.respondWith(router);
    history.navigate("/two");
    setup = false;

    history.go(-1);
  }
};
