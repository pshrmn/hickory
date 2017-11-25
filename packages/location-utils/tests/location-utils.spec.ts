import 'jest';
import {
  completePathname,
  completeHash,
  completeQuery,
  stripPrefix,
  stripBaseSegment
} from '../src';

describe('location utils', () => {
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

  describe('stripPrefix', () => {
    it('removes the prefix from provided string', () => {
      expect(stripPrefix('/test/string', '/test')).toBe('/string');
    });

    it('does nothing when the string does not begin with the prefix', () => {
      expect(stripPrefix('/string', '/test')).toBe('/string');
    });
  });

  describe('stripBaseSegment', () => {
    it('strips the baseSegment off of the beginning of the path', () => {
      const withBase = '/prefix/this-is-a-test';
      expect(stripBaseSegment(withBase, '/prefix')).toBe('/this-is-a-test');
    });

    it('is not case-sensitive', () => {
      const withBase = '/prefix/this-is-a-test';
      expect(stripBaseSegment(withBase, '/PREFIX')).toBe('/this-is-a-test');
    });

    it('works when the first character after the baseSegment is a ?,#, or end of string', () => {
      expect(stripBaseSegment('/prefix?query=true', '/prefix')).toBe('?query=true');
      expect(stripBaseSegment('/prefix#yo', '/prefix')).toBe('#yo');
      expect(stripBaseSegment('/prefix', '/prefix')).toBe('');
    });

    it('does nothing if the path does not contain the base segment', () => {
      const noBase = '/this-is-a-test';
      expect(stripBaseSegment(noBase, '/prefix')).toBe(noBase);
    });

    it('does not strip for incomplete prefix matches', () => {
      const incompletePath = '/prefixthis-is-the-path';
      expect(stripBaseSegment(incompletePath, '/prefix')).toBe(incompletePath);
    });
  });
});
