import "jest";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg:
    "does not call response handler when the user prevents the pop navigation",
  async: true,
  assertions: 5,
  fn: function({ constructor, resolve, options = {} }: AsyncTestCaseArgs) {
    let calls = 0;
    const history = constructor(pending => {
      calls++;
      pending.finish();
    }, options);
    expect(calls).toBe(0);

    history.navigate({ url: "/two" }, "push");
    expect(calls).toBe(1);

    history.navigate({ url: "/three" }, "push");
    expect(calls).toBe(2);

    history.confirmWith((_info, _confirm, prevent) => {
      prevent();
    });

    history.go(-2);
    setTimeout(() => {
      expect(calls).toBe(2);
      expect(history.location).toMatchObject({
        pathname: "/three",
        key: [2, 0]
      });
      resolve();
    }, 10);
  }
};
