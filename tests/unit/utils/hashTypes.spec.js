import hashEncoderAndDecoder from '../../../src/utils/hashTypes';

function runTestCases(fn, cases) {
  cases.forEach(([ input, output ]) => {
    expect(fn(input)).toBe(output);
  });
}

describe('hash types', () => {
  describe('basic', () => {
    const { encode, decode } = hashEncoderAndDecoder('basic');
    it('decode removes #, ensures leading /', () => {
      const testCases = [
        ['#/with-slash', '/with-slash'],
        ['#without-slash', '/without-slash']
      ];
      runTestCases(decode, testCases);
    });

    it('encode returns string that begins with #/', () => {
      const testCases = [
        ['/with-slash', '#/with-slash'],
        ['without-slash', '#/without-slash']
      ];
      runTestCases(encode, testCases);
    });

    it('is the default option', () => {
      const { encode, decode } = hashEncoderAndDecoder();
      it('decode removes #, ensures leading /', () => {
        const testCases = [
          ['#/with-slash', '/with-slash'],
          ['#without-slash', '/without-slash']
        ];
        runTestCases(decode, testCases);
      });

      it('encode returns string that begins with #/', () => {
        const testCases = [
          ['/with-slash', '#/with-slash'],
          ['without-slash', '#/without-slash']
        ];
        runTestCases(encode, testCases);
      });
    });

    it('is used when provided an invalid hash type', () => {
      const { encode, decode } = hashEncoderAndDecoder('invalid-type');
      it('decode removes #, ensures leading /', () => {
        const testCases = [
          ['#/with-slash', '/with-slash'],
          ['#without-slash', '/without-slash']
        ];
        runTestCases(decode, testCases);
      });

      it('encode returns string that begins with #/', () => {
        const testCases = [
          ['/with-slash', '#/with-slash'],
          ['without-slash', '#/without-slash']
        ];
        runTestCases(encode, testCases);
      });
    });
  });

  describe('clean', () => {
    const { encode, decode } = hashEncoderAndDecoder('clean');
    it('decode removes #, ensures leading /', () => {
      const testCases = [
        ['#/with-slash', '/with-slash'],
        ['#without-slash', '/without-slash']
      ];
      runTestCases(decode, testCases);
    });

    it('encode returns string that begins with #, but no slash', () => {
      const testCases = [
        ['/with-slash', '#with-slash'],
        ['without-slash', '#without-slash']
      ];
      runTestCases(encode, testCases);
    });

    it('encodes with leading slash when at the root', () => {
      const testCases = [
        ['/', '#/'],
        ['/?query=true', '#/?query=true'],,
        ['/#hash', '#/#hash']
      ];
      runTestCases(encode, testCases);
    });
  });

  describe('bang', () => {
    const { encode, decode } = hashEncoderAndDecoder('bang');
    it('decode removes # and !, ensures leading /', () => {
      const testCases = [
        ['#/with-slash', '/with-slash'],
        ['#without-slash', '/without-slash']
      ];
      runTestCases(decode, testCases);
    });

    it('encode returns string that begins with #!/', () => {
      const testCases = [
        ['/with-slash', '#!/with-slash'],
        ['without-slash', '#!/without-slash']
      ];
      runTestCases(encode, testCases);
    });
  });
});
