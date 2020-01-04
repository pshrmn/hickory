import { TestCaseArgs } from "../../types";

export default {
  msg: "replace increments minor key",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    let calls = 0;
    let initMajorNum, initMinorNum;
    let history = constructor(pending => {
      pending.finish();
      switch (calls++) {
        case 0:
          let [initMajor, initMinor] = history.location.key;
          initMajorNum = initMajor;
          initMinorNum = initMinor;
          break;
        case 1:
          let current = history.location;
          let [currentMajor, currentMinor] = current.key;

          expect(currentMajor).toEqual(initMajorNum);
          expect(currentMinor).toBe(initMinorNum + 1);
      }
    }, options);
    history.navigate({ url: "/one" });
  }
};
