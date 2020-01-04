import { TestCaseArgs } from "../../types";

export default {
  msg: "triggers a response handler call if handler is registered",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    let router = jest.fn();
    let history = constructor(router, options);
    history.navigate({ url: "/two" });
    expect(router.mock.calls.length).toBe(1);
  }
};
