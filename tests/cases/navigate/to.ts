import "jest";

import { TestCaseArgs } from "../../types";

export default {
  msg: "creates object from url string",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    let history = constructor(pending => {
      expect(pending.location).toMatchObject({
        pathname: "/two",
        query: "test=ing"
      });
    }, options);
    history.navigate({ url: "/two?test=ing" });
  }
};
