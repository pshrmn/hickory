import "jest";
import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: "finishing pop sets location",
  async: true,
  assertions: 1,
  fn: function({ history, resolve }: AsyncTestCaseArgs) {
    let setup = true;
    const router = ignoreFirstCall(function(pending) {
      pending.finish();
      if (setup) {
        return;
      }
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
