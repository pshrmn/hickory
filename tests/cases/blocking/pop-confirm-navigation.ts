import "jest";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: "calls response handler after the user confirms the pop navigation",
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

    history.confirmWith((_info, confirm, _prevent) => {
      confirm();
    });

    history.go(-2);
    setTimeout(() => {
      expect(calls).toBe(3);
      expect(history.location).toMatchObject({
        pathname: "/one",
        key: [0, 0]
      });
      resolve();
    }, 10);
  }
};
