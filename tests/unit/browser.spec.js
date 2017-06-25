import Browser from '../../src/browser';
import { jsdom } from 'jsdom';

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe('Browser history', () => {

  let dom;
  let window;

  beforeEach(() => {
    dom = jsdom('', {
      url: 'http://example.com/one'
    });
    window = global.window = dom.defaultView;
  });

  afterEach(() => {
    dom.close();
  });

  describe('constructor', () => {
    it('returns object with expected API', () => {
      const testHistory = Browser();
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
      const testHistory = Browser();
      expect(testHistory.location).toMatchObject({
        pathname: '/one',
        hash: '',
        query: ''
      });
    });
  });

  describe('update', () => {
    it('pushes when given a location that creates a new path', () => {
      const testHistory = Browser();
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.update({ pathname: 'next', hash: 'not-a-test' });

      const args = subscriber.mock.calls[0];
      expect(args[1]).toBe('PUSH');
    });

    it('replace when given a new location that creates the same path', () => {
      const testHistory = Browser();
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.update({ pathname: '/one' });

      const args = subscriber.mock.calls[0];
      expect(args[1]).toBe('REPLACE');
    });
  });

  describe('push', () => {
    it('pushes new location with incremented key', () => {
      const testHistory = Browser();

      let [initialMajor] = testHistory.location.key.split('.');
      initialMajor = parseInt(initialMajor, 10);

      testHistory.push('/next');

      let [replacedMajor] = testHistory.location.key.split('.');
      replacedMajor = parseInt(replacedMajor, 10);

      expect(replacedMajor).toBe(initialMajor + 1);
      expect(testHistory.location).toMatchObject({
        pathname: '/next'
      });
    });

    it('emits the new location and action to any subscribers', () => {
      const testHistory = Browser();
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.push('/next');
      expect(subscriber.mock.calls.length).toBe(1);
      const args = subscriber.mock.calls[0];
      expect(args[0]).toMatchObject({
        pathname: '/next'
      });
      expect(args[1]).toBe('PUSH');
    });

    it('increments current major key value by 1, sets minor value to 0', () => {
      const testHistory = Browser();


      let [ initMajor ] = testHistory.location.key.split('.');
      initMajor = parseInt(initMajor, 10);

      testHistory.push('/next');


      const current = testHistory.location;
      let [ currentMajor, currentMinor ] = current.key.split('.');
      currentMajor = parseInt(currentMajor, 10);


      expect(currentMajor).toEqual(initMajor + 1);
      expect(currentMinor).toBe('0');
    });

    it('increments from current location\'s key when not at end of locations', (done) => {
      const testHistory = Browser();

      testHistory.push('/two'); // 1.0
      testHistory.push('/three'); // 2.0
      testHistory.push('/four'); // 3.0
      testHistory.push('/five'); // 4.0

      let calls = 0;
      let unsubscribe;
      function subscribe(location) {
        calls++;
        if (calls > 1) {
          unsubscribe();
          return;
        }
        testHistory.push('/new-four');
        expect(testHistory.location.key).toBe('3.0');
        done();
      }

      unsubscribe = testHistory.subscribe(subscribe);

      testHistory.go(-2); // 2.0

    });

    it('sets history.action to "PUSH"', () => {
      const testHistory = Browser();
      testHistory.push('/next');
      expect(testHistory.action).toBe('PUSH');
    });

    it('emits new location/action when the user confirms the navigation', () => {
      const testHistory = Browser();
      const subscriber = jest.fn();
      const confirm = (location, action, success, failure) => {
        success();
      };
      testHistory.confirmWith(confirm);
      testHistory.subscribe(subscriber);

      testHistory.push('/next');
      expect(subscriber.mock.calls.length).toBe(1);
    });

    it('does not emit when the user does not confirm the navigation', () => {
      const testHistory = Browser();
      const subscriber = jest.fn();
      const confirm = (location, action, success, failure) => {
        failure();
      };
      testHistory.confirmWith(confirm);
      testHistory.subscribe(subscriber);

      testHistory.push('/next');
      expect(subscriber.mock.calls.length).toBe(0);
    });

  });

  describe('replace', () => {
    it('replaces current location, but maintains major key', () => {
      const testHistory = Browser();

      let [initialMajor] = testHistory.location.key.split('.');
      initialMajor = parseInt(initialMajor, 10);

      testHistory.replace('/same');

      let [replacedMajor] = testHistory.location.key.split('.');
      replacedMajor = parseInt(replacedMajor, 10);

      expect(replacedMajor).toEqual(initialMajor);
      expect(testHistory.location).toMatchObject({
        pathname: '/same'
      });
    });

    it('emits the new location and action to any subscribers', () => {
      const testHistory = Browser();
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.replace('/same');
      expect(subscriber.mock.calls.length).toBe(1);
      const args = subscriber.mock.calls[0];
      expect(args[0]).toMatchObject({
        pathname: '/same'
      });
      expect(args[1]).toBe('REPLACE');
    });

    it('creates location object with key\'s minor value incremented', () => {
      const testHistory = Browser();

      let [ firstMajor, firstMinor ] = testHistory.location.key.split('.');
      firstMinor = parseInt(firstMinor, 10);

      testHistory.replace('/same');
      let [ secondMajor, secondMinor ] = testHistory.location.key.split('.');
      secondMinor = parseInt(secondMinor, 10);

      expect(secondMinor).toBe(firstMinor + 1)
    });

    it('sets history.action to "REPLACE"', () => {
      const testHistory = Browser();
      testHistory.replace('/same');
      expect(testHistory.action).toBe('REPLACE');
    });

    it('emits new location/action when the user confirms the navigation', () => {
      const testHistory = Browser();
      const subscriber = jest.fn();
      const confirm = (location, action, success, failure) => {
        success();
      };
      testHistory.confirmWith(confirm);
      testHistory.subscribe(subscriber);

      testHistory.replace('/same');
      expect(subscriber.mock.calls.length).toBe(1);
    });

    it('does not emit when the user does not confirm the navigation', () => {
      const testHistory = Browser();
      const subscriber = jest.fn();
      const confirm = (location, action, success, failure) => {
        failure();
      };
      testHistory.confirmWith(confirm);
      testHistory.subscribe(subscriber);

      testHistory.replace('/same');
      expect(subscriber.mock.calls.length).toBe(0);
    });
  });

  describe('go', () => {
    it('does nothing if the value is outside of the range', () => {
      const testHistory = Browser();
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.go(10);

      expect(subscriber.mock.calls.length).toBe(0);
    });

    it('re-emits the current location if called with no value', () => {
      const testHistory = Browser();

      let hasBeenCalled = false;
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.push('/next');
      testHistory.go();
      // when called with no args, we don't actually call window.history.go
      // so we can run this test synchronously
      const [firstCall, secondCall] = subscriber.mock.calls;
      // same location
      expect(secondCall[0]).toEqual(firstCall[0]);
      // but second call is a POP
      expect(secondCall[1]).toBe('POP');
    });

    it('sets the new location/action using the provided number and emits', (done) => {
      const testHistory = Browser();

      testHistory.push('/two'); // 1.0
      testHistory.push('/three'); // 2.0
      testHistory.push('/four'); // 3.0
      testHistory.push('/five'); // 4.0
      testHistory.push('/six'); // 5.0

      function subscriber(location, action) {
        expect(location).toMatchObject({
          pathname: '/four',
          key: '3.0'
        });      
        expect(action).toBe('POP');
        done();
      }
      testHistory.subscribe(subscriber);

      testHistory.go(-2);
    });

    it('emits new location/action when the user confirms the navigation', (done) => {
      const testHistory = Browser();
      testHistory.push('/two'); // 1.0
      testHistory.push('/three'); // 2.0

      testHistory.confirmWith((location, action, success, failure) => {
        success();
      });
      
      function subscriber(location) {
        expect(testHistory.location).toMatchObject({
          pathname: '/one',
          key: '0.0'
        });
        done();
      }
      testHistory.subscribe(subscriber);

      testHistory.go(-2);
    });

    it('does not emit when the user does not confirm the navigation', (done) => {
      const testHistory = Browser();
      testHistory.push('/two'); // 1.0
      testHistory.push('/three'); // 2.0

      testHistory.confirmWith((location, action, success, failure) => {
        failure();
      });
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.go(-2);
      setTimeout(() => {
        expect(testHistory.location).toMatchObject({
          pathname: '/three',
          key: '2.0'
        });
        expect(subscriber.mock.calls.length).toBe(0);
        done();
      }, 10);
    });
  });

  describe('toHref', () => {
    it('returns the location formatted as a string', () => {
      const testHistory = Browser();

      testHistory.push({ pathname: '/one', query: 'test=query' });

      const currentPath = testHistory.toHref(testHistory.location);
      expect(currentPath).toBe('/one?test=query');
    });
  });
});
