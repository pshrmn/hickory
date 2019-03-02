import "jest";

import { AsyncTestCaseArgs } from "../../types";

export default {
  msg: "pop is cancelled if there is a pop before pending response finishes",
  async: true,
  assertions: 1,
  fn: function({ history, resolve }: AsyncTestCaseArgs) {
    let calls = 0;
    history.respondWith(pending => {
      switch (calls++) {
        case 0:
          pending.finish();
          history.navigate("/two", "push");
          break;
        case 1:
          pending.finish();
          history.navigate("/three", "push");
          break;
        case 2:
          pending.finish();
          history.navigate("/four", "push");
          break;
        case 3:
          pending.finish();
          history.navigate("/five", "push");
          break;
        case 4:
          pending.finish();
          history.navigate("/six", "push");
          break;
        case 5:
          pending.finish();
          history.go(-2);
          break;
        case 6:
          history.go(-1);
          break;
        case 7:
          pending.finish();
          expect(history.location).toMatchObject({
            pathname: "/three",
            key: "2.0"
          });
          resolve();
      }
    });
  }
};
