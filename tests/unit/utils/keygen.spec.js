import createKeyGenerator from '../../../src/utils/keygen';

describe('key generator', () => {
  it('returns a function that returns a string key', () => {
    const keyGen = createKeyGenerator();
    const key = keyGen();
    expect(typeof key).toBe('string');
  });

  describe('key', () => {
    it('has two parts, the major and the minor version, separated by period', () => {
      const keyGen = createKeyGenerator();
      const key = keyGen();
      expect(key.split('.').length).toBe(2);
    });

    describe('major', () => {
      it('defaults to 0', () => {
        const keyGen = createKeyGenerator();
        const key = keyGen();
        const [ major, minor ] = key.split('.');
        expect(major).toBe('0');
      });

      it('starts incrementing from provided integer', () => {
        const keyGen = createKeyGenerator(78);
        const key = keyGen();
        const [ major, minor ] = key.split('.');
        expect(major).toBe('78');
      });

      it('increments on successive calls', () => {
        const keyGen = createKeyGenerator();
        keyGen();
        const secondKey = keyGen();
        const [ major, minor ] = secondKey.split('.');
        expect(major).toBe('1');
      });
    });

    describe('minor', () => {
      it('defaults to 0', () => {
        const keyGen = createKeyGenerator();
        const key = keyGen();
        const [ major, minor ] = key.split('.');
        expect(minor).toBe('0');
      });

      it('if key provided, increments minor value, but keeps same major', () => {
        const keyGen = createKeyGenerator();
        const existingKey = '123.456';
        const newKey = keyGen(existingKey);
        const [ major, minor ] = newKey.split('.');
        expect(major).toBe('123');
        expect(minor).toBe('457');
      });
    });
  });
});
