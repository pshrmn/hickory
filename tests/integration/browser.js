import BrowserHistory from '../../src/browser';

describe('browser integration tests', () => {

  let testHistory;

  beforeEach(() => {
    // we cannot fully reset the history, but this can give us a blank state
    window.history.pushState(null, null, '/');
    testHistory = new BrowserHistory();
  });

  afterEach(() => {
    testHistory.destroy();
  });

  describe('push', () => {
    it('can navigate with push', () => {
      const testHistory = new BrowserHistory();
      testHistory.push('/the-new-location');
      expect(window.location.pathname).toEqual('/the-new-location');
    });
  });

  describe('replace', () => {
    it('can navigate with replace', () => {
      const testHistory = new BrowserHistory();
      testHistory.replace('/the-same-location');
      expect(window.location.pathname).toEqual('/the-same-location');
    });
  });

  describe('go', () => {
    it('can navigate with go', (done) => {
      const testHistory = new BrowserHistory();
      testHistory.push('/one');
      testHistory.push('/two');
      testHistory.push('/three');

      let unsubscribe;

      function subscriber(location) {
        expect(location.pathname).toEqual('/one');
        unsubscribe();
        done();
      }
      unsubscribe = testHistory.subscribe(subscriber);

      testHistory.go(-2);
    });
  });

  describe('browser navigation', () => {
    it('can detect navigation triggered by the browser', (done) => {
      const testHistory = new BrowserHistory();
      testHistory.push('/uno');
      testHistory.push('/dos');
      testHistory.push('/tres');

      let unsubscribe;

      function subscriber(location) {
        expect(location.pathname).toEqual('/uno');
        unsubscribe();
        done();
      }
      unsubscribe = testHistory.subscribe(subscriber);

      window.history.go(-2);
    });
  });
});
