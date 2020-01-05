import "jest";

import { TestCaseArgs } from "../../types";

export default {
  msg:
    "does not call response handler when the user prevents the navigate() navigation",
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

    history.confirmWith((_info, _confirm, prevent) => {
      prevent();
    });

    history.navigate({ url: "/four" });
    expect(calls).toBe(2);
    expect(history.location).toMatchObject({
      pathname: "/three",
      key: [2, 0]
    });
  }
};
