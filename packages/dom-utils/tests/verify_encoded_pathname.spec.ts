import "jest";
import { verify_encoded_pathname } from "../src";

describe("verify_encoded_pathname", () => {
  it("does not throw if given a fully encoded pathname", () => {
    expect(() => {
      verify_encoded_pathname("/test%20ing");
    }).not.toThrow();
  });

  it("throws if given a non-encoded pathname", () => {
    expect(() => {
      verify_encoded_pathname("/test ing");
    }).toThrow();
  });
});
