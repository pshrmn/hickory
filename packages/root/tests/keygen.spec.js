import createKeyGenerator from '../src/keygen';

describe('key generator', () => {
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

  describe('diff', () => {
    it('returns the different between the major value of two keys', () => {
      const keyGen = createKeyGenerator();
      const first = '5.3';
      const second = '10.4';
      expect(keyGen.diff(first, second)).toBe(5);
      expect(keyGen.diff(second, first)).toBe(-5);
    });
  });
});
