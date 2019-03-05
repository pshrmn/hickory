import "jest";

import { TestCaseArgs } from "../../types";

export default {
  msg: "works with string locations",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    const history = constructor(pending => {
      expect(pending.location).toMatchObject({
        pathname: "/two",
        query: "test=ing"
      });
    }, options);
    history.navigate("/two?test=ing");
  }
};
