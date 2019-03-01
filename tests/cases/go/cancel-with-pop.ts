import "jest";
import { ignoreFirstCall } from "../../utils/ignoreFirst";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: "pop is cancelled if there is a pop before pending response finishes",
  async: true,
  assertions: 2,
  fn: function({ history, resolve }: AsyncTestCaseArgs) {
    function initialRouter(pending) {
      pending.finish();
    }
    let cancelGo;
    const goRouter = ignoreFirstCall(function(pending) {
      cancelGo = pending.cancel;
      // trigger a push call and don't resolve the go
      history.respondWith(popRouter);
      history.go(-1);
    });
    const popRouter = ignoreFirstCall(function(pending) {
      cancelGo("pop");
      setTimeout(() => {
        expect(history.location.pathname).toBe("/six");
        // but it is once we finish the pop
        pending.finish();
        expect(history.location.pathname).toBe("/three");
        resolve();
      }, 50);
    });

    history.respondWith(initialRouter);
    history.navigate("/two", "push"); // 1.0
    history.navigate("/three", "push"); // 2.0
    history.navigate("/four", "push"); // 3.0
    history.navigate("/five", "push"); // 4.0
    history.navigate("/six", "push"); // 5.0

    history.respondWith(goRouter);
    history.go(-2);
  }
};
