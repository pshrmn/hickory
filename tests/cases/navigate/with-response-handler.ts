import { TestCaseArgs } from "../../types";

export default {
  msg: "triggers a response handler call if handler is registered",
  fn: function({ pendingHistory }: TestCaseArgs) {
    const router = jest.fn();
    const history = pendingHistory(router);
    history.navigate("/two");
    expect(router.mock.calls.length).toBe(1);
  }
};
