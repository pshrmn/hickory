import { TestCaseArgs } from "../../types";

export default {
  msg: "push increments major key",
  fn: function({ constructor, options = {} }: TestCaseArgs) {
    let calls = 0;
    let initMajorNum;
    const history = constructor(pending => {
      pending.finish();
      switch (calls++) {
        case 0:
          const [initMajor] = history.location.key;
          initMajorNum = initMajor;
          break;
        case 1:
          const current = history.location;
          const [currentMajor, currentMinor] = current.key;
          expect(currentMajor).toEqual(initMajorNum + 1);
          expect(currentMinor).toBe(0);
      }
    }, options);
    history.navigate("/next");
  }
};
