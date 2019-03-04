import "jest";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: "finishing pop sets location",
  async: true,
  assertions: 1,
  fn: function({ shell, resolve }: AsyncTestCaseArgs) {
    let calls = 0;
    const history = shell(pending => {
      let localHistory = history;
      switch (calls++) {
        case 0:
          pending.finish();
          localHistory.navigate("/two");
          break;
        case 1:
          pending.finish();
          localHistory.go(-1);
          break;
        case 2:
          pending.finish();
          expect(localHistory.location).toMatchObject({
            pathname: "/one"
          });
          resolve();
      }
    });
    history.current();
  }
};
