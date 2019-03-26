import "jest";
import { verify_encoded_pathname } from "../src";

describe("verify_encoded_pathname", () => {
  it("returns true if given a fully encoded pathname", () => {
    expect(verify_encoded_pathname("/test%20ing")).toBe(true);
  });

  it("returns false if given a non-encoded pathname", () => {
    expect(verify_encoded_pathname("/test ing")).toBe(false);
  });
});
