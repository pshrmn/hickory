import "jest";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: "cancels the pending navigation",
  async: true,
  assertions: 1,
  fn: function({ pendingHistory, resolve }: AsyncTestCaseArgs) {
    let calls = 0;
    const history = pendingHistory(pending => {
      let localHistory = history;
      switch (calls++) {
        case 0:
          pending.finish();
          localHistory.navigate("/two", "push");
          break;
        case 1:
          pending.finish();
          localHistory.navigate("/three", "push");
          break;
        case 2:
          pending.finish();
          localHistory.navigate("/four", "push");
          break;
        case 3:
          pending.finish();
          localHistory.navigate("/five", "push");
          break;
        case 4:
          pending.finish();
          localHistory.navigate("/six", "push");
          break;
        case 5:
          pending.finish();
          localHistory.go(-1);
          break;
        case 6:
          localHistory.cancel();
          pending.finish();
          setTimeout(() => {
            expect(localHistory.location).toMatchObject({
              pathname: "/six",
              key: [5, 0]
            });
            resolve();
          }, 25);
      }
    });
    history.current();
  }
};
