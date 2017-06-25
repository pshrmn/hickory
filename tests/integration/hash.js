import Hash from '../../src/hash';


describe('hash integration tests', () => {

  let testHistory;

  beforeEach(() => {
    testHistory = Hash();
    // we cannot fully reset the history, but this can give us a blank state
    window.history.pushState(null, null, '/#/');
  });

  afterEach(() => {
    testHistory.destroy();
  });

  describe('push', () => {
    it('can navigate with push', () => {
      testHistory.push('/a-new-position');
      expect(window.location.hash).toEqual('#/a-new-position');
    });
  });

  describe('replace', () => {
    it('can navigate with replace', () => {
      testHistory.replace('/the-same-position');
      expect(window.location.hash).toEqual('#/the-same-position');
    });
  });


  describe('go', () => {
    it('can navigate with go', (done) => {
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
