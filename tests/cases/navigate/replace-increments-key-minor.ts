import { TestCaseArgs } from "../../types";

export default {
  msg: "replace increments minor key",
  fn: function({ pendingHistory }: TestCaseArgs) {
    let calls = 0;
    let initMajorNum, initMinorNum;
    const history = pendingHistory(pending => {
      pending.finish();
      switch (calls++) {
        case 0:
          const [initMajor, initMinor] = history.location.key.split(".");
          initMajorNum = parseInt(initMajor, 10);
          initMinorNum = parseInt(initMinor, 10);
          break;
        case 1:
          const current = history.location;
          const [currentMajor, currentMinor] = current.key.split(".");
          const currentMajorNum = parseInt(currentMajor, 10);
          const currentMinorNum = parseInt(currentMinor, 10);

          expect(currentMajorNum).toEqual(initMajorNum);
          expect(currentMinorNum).toBe(initMinorNum + 1);
      }
    });

    history.navigate("/one");
  }
};
