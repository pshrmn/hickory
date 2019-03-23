import "jest";
import hash_encoder_and_decoder from "../../src/hashTypes";

function run_test_cases(fn, cases) {
  cases.forEach(([input, output]) => {
    expect(fn(input)).toBe(output);
  });
}

describe("hash types", () => {
  describe("basic", () => {
    const { encode, decode } = hash_encoder_and_decoder("basic");
    it("decode removes #, ensures leading /", () => {
      const test_cases = [
        ["#/with-slash", "/with-slash"],
        ["#without-slash", "/without-slash"]
      ];
      run_test_cases(decode, test_cases);
    });

    it("encode returns string that begins with #/", () => {
      const test_cases = [
        ["/with-slash", "#/with-slash"],
        ["without-slash", "#/without-slash"]
      ];
      run_test_cases(encode, test_cases);
    });

    describe("basic is the default option", () => {
      const { encode, decode } = hash_encoder_and_decoder();
      it("decode removes #, ensures leading /", () => {
        const test_cases = [
          ["#/with-slash", "/with-slash"],
          ["#without-slash", "/without-slash"]
        ];
        run_test_cases(decode, test_cases);
      });

      it("encode returns string that begins with #/", () => {
        const test_cases = [
          ["/with-slash", "#/with-slash"],
          ["without-slash", "#/without-slash"]
        ];
        run_test_cases(encode, test_cases);
      });
    });

    describe("basic is used when provided an invalid hash type", () => {
      const { encode, decode } = hash_encoder_and_decoder("invalid-type");
      it("decode removes #, ensures leading /", () => {
        const test_cases = [
          ["#/with-slash", "/with-slash"],
          ["#without-slash", "/without-slash"]
        ];
        run_test_cases(decode, test_cases);
      });

      it("encode returns string that begins with #/", () => {
        const test_cases = [
          ["/with-slash", "#/with-slash"],
          ["without-slash", "#/without-slash"]
        ];
        run_test_cases(encode, test_cases);
      });
    });
  });

  describe("clean", () => {
    const { encode, decode } = hash_encoder_and_decoder("clean");
    it("decode removes #, ensures leading /", () => {
      const test_cases = [
        ["#/with-slash", "/with-slash"],
        ["#without-slash", "/without-slash"]
      ];
      run_test_cases(decode, test_cases);
    });

    it("encode returns string that begins with #, but no slash", () => {
      const test_cases = [
        ["/with-slash", "#with-slash"],
        ["without-slash", "#without-slash"]
      ];
      run_test_cases(encode, test_cases);
    });

    it("encodes with leading slash when at the root", () => {
      const test_cases = [
        ["/", "#/"],
        ["/?query=true", "#/?query=true"],
        ,
        ["/#hash", "#/#hash"]
      ];
      run_test_cases(encode, test_cases);
    });
  });

  describe("bang", () => {
    const { encode, decode } = hash_encoder_and_decoder("bang");
    it("decode removes # and !, ensures leading /", () => {
      const test_cases = [
        ["#/with-slash", "/with-slash"],
        ["#without-slash", "/without-slash"]
      ];
      run_test_cases(decode, test_cases);
    });

    it("encode returns string that begins with #!/", () => {
      const test_cases = [
        ["/with-slash", "#!/with-slash"],
        ["without-slash", "#!/without-slash"]
      ];
      run_test_cases(encode, test_cases);
    });
  });
});
