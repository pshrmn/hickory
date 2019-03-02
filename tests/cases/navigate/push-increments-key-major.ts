import { TestCaseArgs } from "../../types";

export default {
  msg: "push increments major key",
  fn: function({ history }: TestCaseArgs) {
    function router(pending) {
      pending.finish();
    }
    history.respondWith(router);

    const [initMajor] = history.location.key.split(".");
    const initMajorNum = parseInt(initMajor, 10);

    history.navigate("/next");

    const current = history.location;
    const [currentMajor, currentMinor] = current.key.split(".");
    const currentMajorNum = parseInt(currentMajor, 10);

    expect(currentMajorNum).toEqual(initMajorNum + 1);
    expect(currentMinor).toBe("0");
  }
};
