import "jest";
import Hash from '../../src';
import { jsdom } from 'jsdom';

declare namespace NodeJS {
  interface Global {
    window: any;
    document: any;
  }
}

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe('Hash constructor', () => {

  let dom;
  let window;

  beforeEach(() => {
    dom = jsdom('', {
      url: 'http://example.com/#/one'
    });
    window = global.window = dom.defaultView;
    global.document = dom;
  });

  afterEach(() => {
    dom.close();
    global.document = undefined;
  });


  it('returns object with expected API', () => {
    const testHistory = Hash();
    const expectedProperties = [
      'location',
      'action',
      'toHref',
      'subscribe',
      'confirmWith',
      'removeConfirmation',
      'destroy'
    ];
    expectedProperties.forEach(property => {
      expect(testHistory.hasOwnProperty(property)).toBe(true);
    });
  });

  it('initializes using window.location', () => {
    const testHistory = Hash();
    expect(testHistory.location).toMatchObject({
      pathname: '/one',
      hash: '',
      query: ''
    });
  });

  it('sets initial action to PUSH when page has not been previously visited', () => {
    window.history.pushState(null, '', '/#has-no-key');
    const testHistory = Hash();
    expect(testHistory.action).toBe('PUSH');
  });

  it('sets initial action to POP when page has not been previously visited', () => {
    window.history.pushState({ key: '17.0' }, '', '/#has-key');
    const testHistory = Hash();
    expect(testHistory. action).toBe('POP');
  });

  describe('no initial hash path', () => {
    beforeEach(() => {
      window.history.pushState(null, '', '/');
    });

    describe('no hashType', () => {
      it('sets the expected hash format', () => {
        expect(window.location.hash).toBe('');
        const testHistory = Hash();
        expect(window.location.hash).toBe('#/');
      });
    });

    describe('default hashType', () => {
      it('sets the expected hash format', () => {
        expect(window.location.hash).toBe('');
        const testHistory = Hash({ hashType: 'default' });
        expect(window.location.hash).toBe('#/');
      });
    });

    describe('bang hashType', () => {
      it('sets the expected hash format', () => {
        expect(window.location.hash).toBe('');
        const testHistory = Hash({ hashType: 'bang' });
        expect(window.location.hash).toBe('#!/');
      });
    });

    describe('clean hashType', () => {
      it('sets the expected hash format', () => {
        expect(window.location.hash).toBe('');
        const testHistory = Hash({ hashType: 'clean' });
        expect(window.location.hash).toBe('#/');
      });
    });
  });

  it('decodes from browser based on options.hashType', () => {
    // default and basic should be the same
    window.history.replaceState(null, '', '#/the-path')
    const noTypeHistory = Hash();
    expect(noTypeHistory.location).toMatchObject({
      pathname: '/the-path'
    });
    const defaultHistory = Hash({ hashType: 'default' });
    expect(defaultHistory.location).toMatchObject({
      pathname: '/the-path'
    });

    // bang expects an exclamation point before the leading slash
    window.history.replaceState(null, '', '#!/the-path')
    const bangHistory = Hash({ hashType: 'bang' });
    expect(bangHistory.location).toMatchObject({
      pathname: '/the-path'
    });

    // clean expects no leading slash
    window.history.replaceState(null, '', '#the-path')
    const cleanHistory = Hash({ hashType: 'clean' });
    expect(cleanHistory.location).toMatchObject({
      pathname: '/the-path'
    });      
  });
});
