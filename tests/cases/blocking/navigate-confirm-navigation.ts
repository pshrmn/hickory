import "jest";

import { TestCaseArgs } from "../../types";

export default {
  msg:
    "calls response handler after the user confirms the navigate() navigation",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
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

    history.navigate({ url: "/four" });
    expect(calls).toBe(3);
    expect(history.location).toMatchObject({
      pathname: "/four",
      key: [3, 0]
    });
  }
};
