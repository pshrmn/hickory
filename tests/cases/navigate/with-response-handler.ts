import { TestCaseArgs } from "../../types";

export default {
  msg: "triggers a response handler call if handler is registered",
  fn: function({ history }: TestCaseArgs) {
    const router = jest.fn();
    history.respondWith(router);
    history.navigate("/two");
    expect(router.mock.calls.length).toBe(2);
  }
};
