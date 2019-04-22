import "jest";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: "pop is cancelled if there is a pop before pending response finishes",
  async: true,
  assertions: 1,
  fn: function({ constructor, resolve, options = {} }: AsyncTestCaseArgs) {
    let calls = 0;
    const history = constructor(pending => {
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
          localHistory.go(-2);
          break;
        case 6:
          localHistory.go(-1);
          break;
        case 7:
          pending.finish();
          expect(localHistory.location).toMatchObject({
            pathname: "/three",
            key: [2, 0]
          });
          resolve();
      }
    }, options);
    history.current();
  }
};
