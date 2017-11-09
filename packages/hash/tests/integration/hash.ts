///<reference path="../../node_modules/@types/jasmine/index.d.ts"/>
import Hash from '../../src';

describe('hash integration tests', () => {

  let testHistory;

  beforeEach(() => {
    // we cannot fully reset the history, but this can give us a blank state
    window.history.pushState(null, '', '/#/');
    testHistory = Hash();
  });

  afterEach(() => {
    testHistory.destroy();
  });

  describe('navigate', () => {
    beforeEach(() => {
      spyOn(window.history, 'pushState').and.callThrough();
      spyOn(window.history, 'replaceState').and.callThrough();
    });

    afterEach(() => {
      (window.history.pushState as jasmine.Spy).calls.reset();
      (window.history.replaceState as jasmine.Spy).calls.reset();
    });

    it('can navigate with navigate', () => {
      testHistory.navigate('/the-new-location');
      expect(window.location.hash).toEqual('#/the-new-location');
    });

    it('sets the state', () => {
      const providedState = { isSet: true };
      testHistory.navigate('/next', providedState);
      const { state, key } = testHistory.location;
      expect(window.history.state.state).toEqual(state);
      expect(window.history.state.key).toBe(key);
    });

    it('calls history.pushState when navigating to a new location', () => {
      testHistory.navigate('/new-location');
      expect((window.history.pushState as jasmine.Spy).calls.count()).toBe(1);
      expect((window.history.replaceState as jasmine.Spy).calls.count()).toBe(0);
    });

    it('calls history.replaceState when navigating to the same location', () => {
      testHistory.navigate('/');
      expect((window.history.pushState as jasmine.Spy).calls.count()).toBe(0);
      expect((window.history.replaceState as jasmine.Spy).calls.count()).toBe(1);
    });
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
