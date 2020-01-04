import "jest";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: "cancels the pending navigation",
  async: true,
  assertions: 1,
  fn: function({ constructor, resolve, options = {} }: AsyncTestCaseArgs) {
    let calls = 0;
    let history = constructor(pending => {
      let localHistory = history;
      switch (calls++) {
        case 0:
          pending.finish();
          localHistory.navigate({ url: "/two" }, "push");
          break;
        case 1:
          pending.finish();
          localHistory.navigate({ url: "/three" }, "push");
          break;
        case 2:
          pending.finish();
          localHistory.navigate({ url: "/four" }, "push");
          break;
        case 3:
          pending.finish();
          localHistory.navigate({ url: "/five" }, "push");
          break;
        case 4:
          pending.finish();
          localHistory.navigate({ url: "/six" }, "push");
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
    }, options);
    history.current();
  }
};
