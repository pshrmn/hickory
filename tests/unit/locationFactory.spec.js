import locationFactory from '../../src/locationFactory';
import qs from 'qs';

describe('locationFactory', () => {
  it('returns an object with createLocation and createPath function properties', () => {
    const createLocation = locationFactory();
    expect(createLocation.createLocation).toBeDefined();
    expect(typeof createLocation.createLocation).toBe('function');
    expect(createLocation.createPath).toBeDefined();
    expect(typeof createLocation.createPath).toBe('function');
  });

  describe('createLocation', () => {
    const { createLocation } = locationFactory();

    describe('from a string', () => {
      it('returns an object with expected properties', () => {
        const loc = createLocation('/pathname?query=this#hash');
        expect(loc.pathname).toBe('/pathname');
        expect(loc.query).toBe('query=this');
        expect(loc.hash).toBe('hash');
        expect(typeof loc.key).toBe('string');
        expect(loc.key.length).toBe(3);
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

      it('adds a key to the location', () => {
        const input = {
          pathname: '/test',
          query: 'one=two',
          hash: 'hello'
        };
        const output = createLocation(input)
        expect(typeof output.key).toBe('string');
        expect(output.key.length).toBe(3);
      });

      it('adds state if provided', () => {
        const input = {
          pathname: '/',
        };
        const details = {
          state: {omg: 'bff'}
        }
        const output = createLocation(input, details);
        expect(output.state).toBeDefined();
        expect(output.state).toBe(details.state);
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
  });
});
