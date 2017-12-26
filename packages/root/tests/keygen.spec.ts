import 'jest';
import createKeyGenerator from '../src/keygen';

describe('key generator', () => {
  describe('major', () => {
    it('starts at the provided base', () => {
      const { keygen } = createKeyGenerator(78);
      const key = keygen.major();
      expect(key).toBe('78.0');
    });

    it('defaults to 0', () => {
      const { keygen } = createKeyGenerator();
      const key = keygen.major();
      expect(key).toBe('0.0');
    });

    it('increments the major value for successive calls', () => {
      const { keygen } = createKeyGenerator();
      expect(keygen.major()).toBe('0.0');
      expect(keygen.major()).toBe('1.0');
      expect(keygen.major()).toBe('2.0');
      expect(keygen.major()).toBe('3.0');
    });

    it('resets major value when provided', () => {
      const { keygen } = createKeyGenerator();
      for (let i = 0; i < 5; i++) {
        keygen.major();
      }

      expect(keygen.major()).toBe('5.0');
      expect(keygen.major('3.0')).toBe('4.0');
      expect(keygen.major()).toBe('5.0');
    });
  });

  describe('minor', () => {
    it('uses the major value from the provided key', () => {
      const { keygen } = createKeyGenerator();
      const key = keygen.minor('18.0');
      expect(key).toBe('18.1');
    });
  });

  describe('diff', () => {
    it('returns the different between the major value of two keys', () => {
      const { keygen } = createKeyGenerator();
      const first = '5.3';
      const second = '10.4';
      expect(keygen.diff(first, second)).toBe(5);
      expect(keygen.diff(second, first)).toBe(-5);
    });
  });
});
