import { TestCaseArgs } from "../../types";

export default {
  msg: "triggers a response handler call if handler is registered",
  fn: function({ shell }: TestCaseArgs) {
    const router = jest.fn();
    const history = shell(router);
    history.navigate("/two");
    expect(router.mock.calls.length).toBe(1);
  }
};
