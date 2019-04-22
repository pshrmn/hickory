import { TestCaseArgs } from "../../types";

export default {
  msg: "triggers a response handler call if handler is registered",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    const router = jest.fn();
    const history = constructor(router, options);
    history.navigate({ url: "/two" });
    expect(router.mock.calls.length).toBe(1);
  }
};
