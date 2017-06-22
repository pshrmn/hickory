import HashHistory from '../../src/hash';


describe('hash integration tests', () => {
  beforeEach(() => {
    // we cannot fully reset the history, but this can give us a blank state
    window.history.replaceState(null, null, '/#/');
  })

  it('can create a hash history', () => {
    expect(() => {
      const testHistory = new HashHistory();
    }).not.toThrow();
  });

  describe('push', () => {
    it('can navigate with push', () => {
      const testHistory = new HashHistory();
      testHistory.push('/a-new-position');
      expect(window.location.hash).toEqual('#/a-new-position');
    });
  });

  describe('replace', () => {
    it('can navigate with replace', () => {
      const testHistory = new HashHistory();
      testHistory.replace('/the-same-position');
      expect(window.location.hash).toEqual('#/the-same-position');
    });
  });

  describe('go', () => {
    it('can navigate with go', (done) => {
      const testHistory = new HashHistory();
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

  describe('hash navigation', () => {
    it('can detect navigation triggered by the hash', (done) => {
      const testHistory = new HashHistory();
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

      window.history.go(-2);
    });
  });
});
