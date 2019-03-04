import "jest";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: "cancels the pending navigation",
  async: true,
  assertions: 1,
  fn: function({ shell, resolve }: AsyncTestCaseArgs) {
    let calls = 0;
    const history = shell(pending => {
      let localHistory = history;
      switch (calls++) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
          pending.finish();
          break;
        case 5:
          localHistory.cancel();
          pending.finish();
          setTimeout(() => {
            expect(localHistory.location).toMatchObject({
              pathname: "/six",
              key: "5.0"
            });
            resolve();
          }, 25);
      }
    });
    history.navigate("/two", "push");
    history.navigate("/three", "push");
    history.navigate("/four", "push");
    history.navigate("/five", "push");
    history.navigate("/six", "push");
    history.go(-1);
  }
};
