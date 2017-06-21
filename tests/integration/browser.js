import BrowserHistory from '../../src/browser';

describe('browser integration tests', () => {
  it('can create a browser history', () => {
    expect(() => {
      const testHistory = new BrowserHistory();
    }).not.to.throw();
  });

  describe('push', () => {
    it('can navigate with push', () => {
      const testHistory = new BrowserHistory();
      const lengthBefore = window.history.length;

      testHistory.push('/the-new-location');

      expect(window.location.pathname).to.equal('/the-new-location');
      expect(window.history.length).to.equal(lengthBefore + 1);
    });
  });

  describe('replace', () => {
    it('can navigate with replace', () => {
      const testHistory = new BrowserHistory();
      const lengthBefore = window.history.length;

      testHistory.replace('/the-same-location');

      expect(window.location.pathname).to.equal('/the-same-location');
      expect(window.history.length).to.equal(lengthBefore);
    });
  });

  describe('go', () => {
    it('can navigate with go', (done) => {
      const testHistory = new BrowserHistory();
      testHistory.push('/one');
      testHistory.push('/two');
      testHistory.push('/three');

      function subscriber(location) {
        expect(location.pathname).to.equal('/one');
        done();
      }
      testHistory.subscribe(subscriber);

      testHistory.go(-2);
    });
  });

  describe('browser navigation', () => {
    it('can detect navigation triggered by the browser', (done) => {
      const testHistory = new BrowserHistory();
      testHistory.push('/one');
      testHistory.push('/two');
      testHistory.push('/three');

      function subscriber(location) {
        expect(location.pathname).to.equal('/one');
        done();
      }
      testHistory.subscribe(subscriber);

      window.history.go(-2);
    });
  });
});
