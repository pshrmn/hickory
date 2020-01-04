import "jest";
import { keyGenerator } from "../src";

describe("key generator", () => {
  describe("major", () => {
    it("returns key whose major value is the stored value", () => {
      let keygen = keyGenerator();
      let key = keygen.major();
      expect(key).toEqual([0, 0]);
    });

    it("increments major value for successive calls", () => {
      let keygen = keyGenerator();
      let key = keygen.major();
      expect(key).toEqual([0, 0]);
      expect(keygen.major()).toEqual([1, 0]);
    });

    describe("previous argument", () => {
      it("increments the provided key's major version by 1", () => {
        let keygen = keyGenerator();
        let key = keygen.major([3, 0]);
        expect(key).toEqual([4, 0]);
      });

      it("sets the key's minor version to 0", () => {
        let keygen = keyGenerator();
        let key = keygen.major([3, 14]);
        expect(key).toEqual([4, 0]);
      });
    });
  });

  describe("minor", () => {
    it("increments the minor value from the provided key", () => {
      let keygen = keyGenerator();
      let key = keygen.minor([0, 0]);
      expect(key).toEqual([0, 1]);
    });

    it("uses the major value from the provided key", () => {
      let keygen = keyGenerator();
      let key = keygen.minor([18, 0]);
      expect(key).toEqual([18, 1]);
    });
  });
});
