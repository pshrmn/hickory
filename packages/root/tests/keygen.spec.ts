import "jest";
import { Common } from "../src";

describe("key generator", () => {
  describe("major", () => {
    it("returns key whose major value is the stored value", () => {
      const { keygen } = Common();
      const key = keygen.major();
      expect(key).toBe("0.0");
    });

    it("increments major value for successive calls", () => {
      const { keygen } = Common();
      const key = keygen.major();
      expect(key).toBe("0.0");
      expect(keygen.major()).toBe("1.0");
    });

    describe("previous argument", () => {
      it("increments the provided key's major version by 1", () => {
        const { keygen } = Common();
        const key = keygen.major("3.0");
        expect(key).toBe("4.0");
      });

      it("sets the key's minor version to 0", () => {
        const { keygen } = Common();
        const key = keygen.major("3.14");
        expect(key).toBe("4.0");
      });
    });
  });

  describe("minor", () => {
    it("increments the minor value from the provided key", () => {
      const { keygen } = Common();
      const key = keygen.minor("0.0");
      expect(key).toBe("0.1");
    });

    it("uses the major value from the provided key", () => {
      const { keygen } = Common();
      const key = keygen.minor("18.0");
      expect(key).toBe("18.1");
    });
  });

  describe("diff", () => {
    it("returns the different between the major value of two keys", () => {
      const { keygen } = Common();
      const first = "5.3";
      const second = "10.4";
      expect(keygen.diff(first, second)).toBe(5);
      expect(keygen.diff(second, first)).toBe(-5);
    });
  });
});
