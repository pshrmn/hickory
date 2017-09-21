///<reference path="../../node_modules/@types/jasmine/index.d.ts"/>
import Browser from '../../src';

describe('browser integration tests', () => {

  let testHistory;

  beforeEach(() => {
    // we cannot fully reset the history, but this can give us a blank state
    window.history.pushState(null, '', '/');
    testHistory = Browser();
  });

  afterEach(() => {
    testHistory.destroy();
  });

  describe('push', () => {
    it('can navigate with push', () => {
      testHistory.push('/the-new-location');
      expect(window.location.pathname).toEqual('/the-new-location');
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
      expect(window.location.pathname).toEqual('/encoded-percent%25');
    });
  });

  describe('replace', () => {
    it('can navigate with replace', () => {
      testHistory.replace('/the-same-location');
      expect(window.location.pathname).toEqual('/the-same-location');
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

  describe('browser navigation', () => {
    it('can detect navigation triggered by the browser', (done) => {
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
