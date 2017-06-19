import createKeyGenerator from '../../../src/utils/keygen';

describe('key generator', () => {
  it('returns an object with two functions: major and minor', () => {
    const keyGen = createKeyGenerator();
    expect(typeof keyGen.major).toBe('function');
    expect(typeof keyGen.minor).toBe('function');
  });

  describe('major', () => {
    it('starts at the provided base', () => {
      const keyGen = createKeyGenerator(78);
      const key = keyGen.major();
      expect(key).toBe('78.0');
    });

    it('defaults to 0', () => {
      const keyGen = createKeyGenerator();
      const key = keyGen.major();
      expect(key).toBe('0.0');
    });

    it('increments the major value for successive calls', () => {
      const keyGen = createKeyGenerator();
      expect(keyGen.major()).toBe('0.0');
      expect(keyGen.major()).toBe('1.0');
      expect(keyGen.major()).toBe('2.0');
      expect(keyGen.major()).toBe('3.0');
    });

    it('resets major value when provided', () => {
      const keyGen = createKeyGenerator();
      for (let i=0; i<5; i++) {
        keyGen.major();
      }

      expect(keyGen.major()).toBe('5.0');
      expect(keyGen.major('3.0')).toBe('4.0');
      expect(keyGen.major()).toBe('5.0');
    })
  });

  describe('minor', () => {
    it('uses the major value from the provided key', () => {
      const keyGen = createKeyGenerator();
      const key = keyGen.minor('18.0');
      expect(key).toBe('18.1');
    });
  });
});
