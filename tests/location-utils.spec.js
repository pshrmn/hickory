import {
  randomKey,
  completePathname,
  completeHash,
  completeQuery
} from '../src/utils/location';

describe('location utils', () => {
  describe('randomKey', () => {
    it('returns a string of six characters', () => {
      const key = randomKey();
      expect(typeof key).toBe('string');
      expect(key.length).toBe(6);
    });
  });

  describe('completePathname', () => {
    it('prepends forward slash if it doesn\'t exist', () => {
      expect(completePathname('test')).toBe('/test');
    });

    it('does nothing if pathname already begins with forward slash', () => {
      expect(completePathname('/best')).toBe('/best');
    });

    it('returns empty string if argument is falsy', () => {
      const falsy = [undefined, null, ''];
      falsy.forEach(value => {
        expect(completePathname(value)).toBe('');
      });
    });
  });

  describe('completeHash', () => {
    it('prepends pound sign if it doesn\'t exist', () => {
      expect(completeHash('test')).toBe('#test');
    });

    it('does nothing if hash already begins with pound sign', () => {
      expect(completeHash('#best')).toBe('#best');
    });

    it('returns empty string if argument is falsy', () => {
      const falsy = [undefined, null, ''];
      falsy.forEach(value => {
        expect(completeHash(value)).toBe('');
      });
    });
  });

  describe('completeQuery', () => {
    it('prepends forward slash if it doesn\'t exist', () => {
      expect(completeQuery('test=one')).toBe('?test=one');
    });

    it('does nothing if pathname already begins with forward slash', () => {
      expect(completeQuery('?best=two')).toBe('?best=two');
    });

    it('returns empty string if argument is falsy', () => {
      const falsy = [undefined, null, ''];
      falsy.forEach(value => {
        expect(completeQuery(value)).toBe('');
      });
    });
  });
});
