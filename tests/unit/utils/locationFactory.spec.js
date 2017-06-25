import locationFactory from '../../../src/utils/locationFactory';
import qs from 'qs';

describe('locationFactory', () => {
  describe('constructor', () => {
    it('throws when attempting to use an invalid baseSegment', () => {
      const badValues = [
        'does-not-start-with-a-slash',
        '/ends-with-slash/',
        null,
        0,
        {},
        [],
      ];
      badValues.forEach((value) => {
        expect(() => {
          const creators = locationFactory({
            baseSegment: value
          })
        }).toThrow();
      });
    });
  });

  describe('createLocation', () => {
    const { createLocation } = locationFactory();

    describe('from a string', () => {
      it('returns an object with expected properties', () => {
        const loc = createLocation('/pathname?query=this#hash', '10.9');
        expect(loc.pathname).toBe('/pathname');
        expect(loc.query).toBe('query=this');
        expect(loc.hash).toBe('hash');
        expect(loc.key).toBe('10.9');
      });
    });

    describe('from an object', () => {
      it('uses provided properties', () => {
        const input = {
          pathname: '/test',
          query: 'one=two',
          hash: 'hello'
        };
        const output = createLocation(input);
        Object.keys(input).forEach(key => {
          expect(output[key]).toEqual(input[key]);
        });
      });

      it('sets default query value if none is provided', () => {
        const input = {
          pathname: '/test',
          hash: 'hello'
        };
        const output = createLocation(input);
        expect(output.query).toBe('');
      });

      it('sets hash to empty string if none is provided', () => {
        const input = {
          pathname: '/test',
          search: 'one=two'
        };
        const output = createLocation(input);
        expect(output.hash).toBe('');
      });

      it('adds provided key to the location', () => {
        const input = {
          pathname: '/test',
          query: 'one=two',
          hash: 'hello'
        };
        const key = '3.22';
        const output = createLocation(input, key);
        expect(output.key).toBe(key);
      });

      it('adds state if provided', () => {
        const input = {
          pathname: '/',
        };
        const state = {
          omg: 'bff'
        };
        const output = createLocation(input, '1.0', state);
        expect(output.state).toBeDefined();
        expect(output.state).toEqual(state);
      });

      it('prefers location.state over state', () => {
        const locState = { fromLocation: true };
        const justState = { fromLocation: false };
        const output = createLocation({ pathname: '/', state: locState}, '1.2', justState);
        expect(output.state).toEqual(locState);
      });
    });

    describe('parse option', () => {
      it('uses the provided query parsing function to make the query value', () => {
        const { createLocation } = locationFactory({
          parse: qs.parse
        });
        const loc = createLocation('/pathname?query=this#hash');
        expect(loc.query).toEqual({ query: 'this' });
      });
    });

    describe('decode option', () => {
      it('decodes the pathname by default', () => {
        const input = {
          pathname: '/t%C3%B6rt%C3%A9nelem'
        };
        const output = createLocation(input);
        expect(output.pathname).toBe('/történelem');
      });

      it('does not decode when decode=false', () => {
        const { createLocation } = locationFactory({ decode: false });
        const input = {
          pathname: '/t%C3%B6rt%C3%A9nelem'
        };
        const output = createLocation(input);
        expect(output.pathname).toBe('/t%C3%B6rt%C3%A9nelem');
      });

      describe('bad encoding', () => {
        it('throws URIError with clearer message when decoding fails', () => {
          const input = {
            pathname: '/bad%'
          };
          expect(() => {
            const output = createLocation(input);
          }).toThrow(
            'Pathname "/bad%" could not be decoded. ' +
              'This is most likely due to a bad percent-encoding. For more information, ' +
              'see the third paragraph here https://tools.ietf.org/html/rfc3986#section-2.4'
          );
        });

        it('does not throw URIError when decode=false', () => {
          const { createLocation } = locationFactory({ decode: false });
          const input = {
            pathname: '/bad%'
          };
          expect(() => {
            const output = createLocation(input);
          }).not.toThrow();
        });
      });
    });

    describe('baseSegment', () => {
      const { createLocation } = locationFactory({ baseSegment: '/prefix' });
      it('strips the baseSegment off of the path before creating a location', () => {
        const location = createLocation('/prefix/this/is/the/rest');
        expect(location.pathname).toBe('/this/is/the/rest');
      });
    });
  });

  describe('createPath', () => {
    const { createPath } = locationFactory();

    describe('pathname', () => {
      it('begins the returned URI with the pathname', () => {
        const input = {
          pathname: '/test'
        };
        const output = createPath(input);
        expect(output).toBe('/test');
      });

      it('prepends forward slash if pathname does not have one', () => {
        const input = {
          pathname: 'test'
        };
        const output = createPath(input);
        expect(output).toBe('/test');
      });
    });

    describe('query', () => {
      it('adds a question mark to the beginning of the query string (if not empty)', () => {
        const input = {
          pathname: '/',
          query: 'one=two'
        };
        const output = createPath(input);
        expect(output).toBe('/?one=two');
      });

      it('does not add question mark if it already exists', () => {
        const input = {
          pathname: '/',
          query: '?one=two'
        };
        const output = createPath(input);
        expect(output).toBe('/?one=two');
      });

      it('does not include the query if stringified version is empty string', () => {
        const input = {
          pathname: '/'
        };
        const output = createPath(input);
        expect(output.indexOf('?')).toBe(-1);
      });
    });

    describe('hash', () => {
      it('adds a pound sign to the beginning of the hash (if not empty)', () => {
        const input = {
          pathname: '/',
          hash: 'yes'
        };
        const output = createPath(input);
        expect(output).toBe('/#yes');
      });

      it('does not add pound sign if it already exists', () => {
        const input = {
          pathname: '/',
          hash: '#no'
        };
        const output = createPath(input);
        expect(output).toBe('/#no');
      });

      it('does not include the hash if it is falsy', () => {
        const falsyValues = ['', null, undefined];
        falsyValues.forEach(v => {
          const output = createPath({ pathname: '/', hash: v });
          expect(output.indexOf('#')).toBe(-1);
        });
      });

      it('places the hash after the query string', () => {
        const input = {
          pathname: '/',
          query: 'before=true',
          hash: 'after'
        };
        const output = createPath(input);
        expect(output.indexOf('?')).toBeLessThan(output.indexOf('#'))
      });
    });

    describe('stringify option', () => {
      it('uses the provided stringify function to turn query into a string', () => {
        const { createPath } = locationFactory({
          stringify: qs.stringify
        });
        const input = {
          pathname: '/',
          query: { one: 'two' }
        };
        const output = createPath(input);
        expect(output).toBe('/?one=two');
      });
    });

    describe('baseSegment', () => {
      it('adds the baseSegment to the path generated from a location', () => {
        const { createPath } = locationFactory({ baseSegment: '/prefix' });
        const location = {
          pathname: '/one/two/three',
          search: '',
          hash: 'four'
        };
        const path = createPath(location);
        expect(path).toBe('/prefix/one/two/three#four');
      });
    });
  });
});
