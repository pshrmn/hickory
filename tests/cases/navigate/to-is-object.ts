import "jest";

import { TestCaseArgs } from "../../types";

export default {
  msg: "works with object locations",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    const history = constructor(pending => {
      expect(pending.location).toMatchObject({
        pathname: "/two",
        hash: "test"
      });
    }, options);
    history.navigate({ pathname: "/two", hash: "test" });
  }
};
