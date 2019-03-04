import { TestCaseArgs } from "../../types";

export default {
  msg: "push increments major key",
  fn: function({ shell }: TestCaseArgs) {
    let calls = 0;
    let initMajorNum;
    const history = shell(pending => {
      pending.finish();
      switch (calls++) {
        case 0:
          const [initMajor] = history.location.key.split(".");
          initMajorNum = parseInt(initMajor, 10);
          break;
        case 1:
          const current = history.location;
          const [currentMajor, currentMinor] = current.key.split(".");
          const currentMajorNum = parseInt(currentMajor, 10);
          expect(currentMajorNum).toEqual(initMajorNum + 1);
          expect(currentMinor).toBe("0");
      }
    });
    history.navigate("/next");
  }
};
