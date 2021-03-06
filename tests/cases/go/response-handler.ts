import "jest";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: `calls response handler with expected location and action`,
  async: true,
  assertions: 2,
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
          history.go(-2);
          break;
        case 6:
          expect(pending.location).toMatchObject({
            pathname: "/four",
            key: [3, 0]
          });
          expect(pending.action).toBe("pop");
          resolve();
      }
    }, options);
    history.current();
  }
};
