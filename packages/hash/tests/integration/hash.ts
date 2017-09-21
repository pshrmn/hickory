///<reference path="../../node_modules/@types/jasmine/index.d.ts"/>
import Hash from '../../src';

describe('hash integration tests', () => {

  let testHistory;

  beforeEach(() => {
    testHistory = Hash();
    // we cannot fully reset the history, but this can give us a blank state
    window.history.pushState(null, '', '/#/');
  });

  afterEach(() => {
    testHistory.destroy();
  });

  describe('push', () => {
    it('can navigate with push', () => {
      testHistory.push('/a-new-position');
      expect(window.location.hash).toEqual('#/a-new-position');
    });

    it('sets the state', () => {
      const providedState = { isSet: true };
      testHistory.push('/next', providedState);
      const { state, key } = testHistory.location;
      expect(window.history.state.state).toEqual(state);
      expect(window.history.state.key).toBe(key);
    });

    it('pushes URL using rawPathname, not pathname', done => {
      testHistory.subscribe(loc => {
        expect(loc.pathname).toEqual('/encoded-percent%')
        done();
      })
      testHistory.push({
        pathname: '/encoded-percent%25'
      });
      expect(window.location.hash).toEqual('#/encoded-percent%25');
    });
  });

  describe('replace', () => {
    it('can navigate with replace', () => {
      testHistory.replace('/the-same-position');
      expect(window.location.hash).toEqual('#/the-same-position');
    });

    it('sets the state', () => {
      const providedState = { isSet: true };
      testHistory.replace('/next', providedState);
      const { state, key } = testHistory.location;
      expect(window.history.state.state).toEqual(state);
      expect(window.history.state.key).toBe(key);
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
