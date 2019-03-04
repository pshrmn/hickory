import "jest";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg:
    "pop is cancelled if there is a replace before pending response finishes",
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
          localHistory.go(-2);
          break;
        case 6:
          localHistory.navigate("/seven", "replace");
          break;
        case 7:
          pending.finish();
          expect(localHistory.location).toMatchObject({
            pathname: "/seven",
            key: "5.1"
          });
          resolve();
      }
    });
    history.current();
  }
};
