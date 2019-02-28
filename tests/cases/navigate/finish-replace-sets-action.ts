import { TestCaseArgs } from "../../types";

export default {
  msg: "calling pending.finish() sets history's action",
  fn: function({ history }: TestCaseArgs) {
    function router(pending) {
      pending.finish();
    }
    history.respondWith(router); // calls router
    history.navigate("/one");
    expect(history.action).toBe("replace");
  }
};
