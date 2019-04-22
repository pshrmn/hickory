import "jest";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: "pop is cancelled if there is a push before pending response finishes",
  async: true,
  assertions: 1,
  fn: function({ constructor, resolve, options = {} }: AsyncTestCaseArgs) {
    let calls = 0;
    const history = constructor(pending => {
      switch (calls++) {
        case 0:
          pending.finish();
          history.navigate({ url: "/two" }, "push");
          break;
        case 1:
          pending.finish();
          history.navigate({ url: "/three" }, "push");
          break;
        case 2:
          pending.finish();
          history.navigate({ url: "/four" }, "push");
          break;
        case 3:
          pending.finish();
          history.navigate({ url: "/five" }, "push");
          break;
        case 4:
          pending.finish();
          history.navigate({ url: "/six" }, "push");
          break;
        case 5:
          pending.finish();
          history.go(-2);
          break;
        case 6:
          history.navigate({ url: "/seven" }, "push");
          break;
        case 7:
          pending.finish();
          expect(history.location).toMatchObject({
            pathname: "/seven",
            key: [6, 0]
          });
          resolve();
      }
    }, options);
    history.current();
  }
};
