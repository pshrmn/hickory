import "jest";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: `calls response handler with expected location and action`,
  async: true,
  fn: function({ history, resolve }: AsyncTestCaseArgs) {
    let setup = false;
    function router(pending) {
      pending.finish();
      if (!setup) {
        return;
      }
      expect(pending.location).toMatchObject({
        pathname: "/four",
        key: "3.0"
      });
      expect(pending.action).toBe("pop");
      resolve();
    }
    history.respondWith(router);
    // prime the history
    history.navigate("/two", "push"); // 1.0
    history.navigate("/three", "push"); // 2.0
    history.navigate("/four", "push"); // 3.0
    history.navigate("/five", "push"); // 4.0
    history.navigate("/six", "push"); // 5.0
    setup = true;

    history.go(-2);
  }
};
