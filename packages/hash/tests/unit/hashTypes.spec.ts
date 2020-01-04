import "jest";
import hashEncoderAndDecoder from "../../src/hashTypes";

function runTestCases(fn, cases) {
  cases.forEach(([input, output]) => {
    expect(fn(input)).toBe(output);
  });
}

describe("hash types", () => {
  describe("basic", () => {
    let { encode, decode } = hashEncoderAndDecoder("basic");
    it("decode removes #, ensures leading /", () => {
      let testCases = [
        ["#/with-slash", "/with-slash"],
        ["#without-slash", "/without-slash"]
      ];
      runTestCases(decode, testCases);
    });

    it("encode returns string that begins with #/", () => {
      let testCases = [
        ["/with-slash", "#/with-slash"],
        ["without-slash", "#/without-slash"]
      ];
      runTestCases(encode, testCases);
    });

    describe("basic is the default option", () => {
      let { encode, decode } = hashEncoderAndDecoder();
      it("decode removes #, ensures leading /", () => {
        let testCases = [
          ["#/with-slash", "/with-slash"],
          ["#without-slash", "/without-slash"]
        ];
        runTestCases(decode, testCases);
      });

      it("encode returns string that begins with #/", () => {
        let testCases = [
          ["/with-slash", "#/with-slash"],
          ["without-slash", "#/without-slash"]
        ];
        runTestCases(encode, testCases);
      });
    });

    describe("basic is used when provided an invalid hash type", () => {
      let { encode, decode } = hashEncoderAndDecoder("invalid-type");
      it("decode removes #, ensures leading /", () => {
        let testCases = [
          ["#/with-slash", "/with-slash"],
          ["#without-slash", "/without-slash"]
        ];
        runTestCases(decode, testCases);
      });

      it("encode returns string that begins with #/", () => {
        let testCases = [
          ["/with-slash", "#/with-slash"],
          ["without-slash", "#/without-slash"]
        ];
        runTestCases(encode, testCases);
      });
    });
  });

  describe("clean", () => {
    let { encode, decode } = hashEncoderAndDecoder("clean");
    it("decode removes #, ensures leading /", () => {
      let testCases = [
        ["#/with-slash", "/with-slash"],
        ["#without-slash", "/without-slash"]
      ];
      runTestCases(decode, testCases);
    });

    it("encode returns string that begins with #, but no slash", () => {
      let testCases = [
        ["/with-slash", "#with-slash"],
        ["without-slash", "#without-slash"]
      ];
      runTestCases(encode, testCases);
    });

    it("encodes with leading slash when at the root", () => {
      let testCases = [
        ["/", "#/"],
        ["/?query=true", "#/?query=true"],
        ,
        ["/#hash", "#/#hash"]
      ];
      runTestCases(encode, testCases);
    });
  });

  describe("bang", () => {
    let { encode, decode } = hashEncoderAndDecoder("bang");
    it("decode removes # and !, ensures leading /", () => {
      let testCases = [
        ["#/with-slash", "/with-slash"],
        ["#without-slash", "/without-slash"]
      ];
      runTestCases(decode, testCases);
    });

    it("encode returns string that begins with #!/", () => {
      let testCases = [
        ["/with-slash", "#!/with-slash"],
        ["without-slash", "#!/without-slash"]
      ];
      runTestCases(encode, testCases);
    });
  });
});
