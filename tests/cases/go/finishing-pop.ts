import "jest";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: "finishing pop sets location",
  async: true,
  assertions: 1,
  fn: function({ constructor, resolve, options = {} }: AsyncTestCaseArgs) {
    let calls = 0;
    const history = constructor(pending => {
      let localHistory = history;
      switch (calls++) {
        case 0:
          pending.finish();
          localHistory.navigate({ url: "/two" });
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
    }, options);
    history.current();
  }
};
