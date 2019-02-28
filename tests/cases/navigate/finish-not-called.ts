import { TestCaseArgs } from "../../types";

export default {
  msg: "does nothing if pending.finish() is not called",
  fn: function({ history }: TestCaseArgs) {
    function router() {}
    history.respondWith(router); // calls router
    history.navigate("/two");
    expect(history.location.pathname).toBe("/one");
  }
};
