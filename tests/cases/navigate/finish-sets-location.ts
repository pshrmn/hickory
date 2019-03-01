import { TestCaseArgs } from "../../types";

export default {
  msg: "calling pending.finish() sets history's location",
  fn: function({ history }: TestCaseArgs) {
    function router(pending) {
      pending.finish();
    }
    history.respondWith(router); // calls router
    history.navigate("/next");
    expect(history.location).toMatchObject({
      pathname: "/next"
    });
  }
};
