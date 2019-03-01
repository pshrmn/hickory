import { TestCaseArgs } from "../../types";

export default {
  msg: "throws when given an invalid nav method",
  fn: function({ history }: TestCaseArgs) {
    const router = jest.fn();
    history.respondWith(router);

    expect(() => {
      // @ts-ignore
      history.navigate("/somewhere", "throws");
    }).toThrowError("Invalid navigation type: throws");
  }
};
