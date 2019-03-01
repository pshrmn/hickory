import { TestCaseArgs } from "../../types";

export default {
  msg: "replace increments minor key",
  fn: function({ history }: TestCaseArgs) {
    function router(pending) {
      pending.finish();
    }
    history.respondWith(router); // calls router

    const [initMajor, initMinor] = history.location.key.split(".");
    const initMajorNum = parseInt(initMajor, 10);
    const initMinorNum = parseInt(initMinor, 10);

    history.navigate("/one");

    const current = history.location;
    const [currentMajor, currentMinor] = current.key.split(".");
    const currentMajorNum = parseInt(currentMajor, 10);
    const currentMinorNum = parseInt(currentMinor, 10);

    expect(currentMajorNum).toEqual(initMajorNum);
    expect(currentMinorNum).toBe(initMinorNum + 1);
  }
};
