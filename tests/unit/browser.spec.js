import BrowserHistory from '../../src/browser';
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
    it('creates location/path creator functions', () => {
      const testHistory = new BrowserHistory();
      expect(typeof testHistory.createLocation).toBe('function');
      expect(typeof testHistory.createPath).toBe('function');
    });

    it('initializes using window.location', () => {
      const testHistory = new BrowserHistory();
      expect(testHistory.locations.length).toBe(1);
      expect(testHistory.index).toBe(0);
      expect(testHistory.location).toMatchObject({
        pathname: '/one',
        hash: '',
        query: ''
      });
    });

    it('sets the index to 0', () => {
      const testHistory = new BrowserHistory();
      expect(testHistory.index).toBe(0);
    }); 
  });

  describe('navigate', () => {
    it('pushes when given a location that creates a new path', () => {
      const testHistory = new BrowserHistory();
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.navigate({ pathname: 'next', hash: 'not-a-test' });

      const args = subscriber.mock.calls[0];
      expect(args[1]).toBe('PUSH');
    });

    it('replace when given a new location that creates the same path', () => {
      const testHistory = new BrowserHistory();
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.navigate({ pathname: '/one' });

      const args = subscriber.mock.calls[0];
      expect(args[1]).toBe('REPLACE');
    });
  });

  describe('push', () => {
    it('pushes new location onto locations array', () => {
      const testHistory = new BrowserHistory();
      expect(testHistory.locations.length).toBe(1);
      expect(testHistory.index).toBe(0);

      testHistory.push('/next');

      expect(testHistory.locations.length).toBe(2);
      expect(testHistory.index).toBe(1);
      expect(testHistory.location).toMatchObject({
        pathname: '/next'
      });
    });

    it('emits the new location and action to any subscribers', () => {
      const testHistory = new BrowserHistory();
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

    it('adds key with incremented major value and minor set to 0', () => {
      const testHistory = new BrowserHistory();


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
      const testHistory = new BrowserHistory();

      testHistory.push('/two'); // 1.0
      testHistory.push('/three'); // 2.0
      testHistory.push('/four'); // 3.0
      testHistory.push('/five'); // 4.0

      testHistory.go(-2); // 2.0

      // popstate is async, so we need to wait for the event to be dispatched
      // before we can check our history
      setTimeout(() => {
        testHistory.push('/new-four');
        expect(testHistory.location.key).toBe('3.0');
        done();
      }, 10);
    });

    it('sets history.action to "PUSH"', () => {
      const testHistory = new BrowserHistory();
      testHistory.push('/next');
      expect(testHistory.action).toBe('PUSH');
    });

    it('emits new location/action when the user confirms the navigation', () => {
      const testHistory = new BrowserHistory();
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
      const testHistory = new BrowserHistory();
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
    it('pushes new location onto locations array', () => {
      const testHistory = new BrowserHistory();
      expect(testHistory.locations.length).toBe(1);
      expect(testHistory.index).toBe(0);

      testHistory.replace('/same');

      expect(testHistory.locations.length).toBe(1);
      expect(testHistory.index).toBe(0);
      expect(testHistory.location).toMatchObject({
        pathname: '/same'
      });
    });

    it('emits the new location and action to any subscribers', () => {
      const testHistory = new BrowserHistory();
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
      const testHistory = new BrowserHistory();

      let [ firstMajor, firstMinor ] = testHistory.location.key.split('.');
      firstMinor = parseInt(firstMinor, 10);

      testHistory.replace('/same');
      let [ secondMajor, secondMinor ] = testHistory.location.key.split('.');
      secondMinor = parseInt(secondMinor, 10);

      expect(secondMinor).toBe(firstMinor + 1)
    });

    it('sets history.action to "REPLACE"', () => {
      const testHistory = new BrowserHistory();
      testHistory.replace('/same');
      expect(testHistory.action).toBe('REPLACE');
    });

    it('emits new location/action when the user confirms the navigation', () => {
      const testHistory = new BrowserHistory();
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
      const testHistory = new BrowserHistory();
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
      const testHistory = new BrowserHistory();
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.go(10);

      expect(subscriber.mock.calls.length).toBe(0);
    });

    it('re-emits the current location if called with no value', () => {
      const testHistory = new BrowserHistory();

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

    it('sets the new index/location using the provided number and emits', (done) => {
      const testHistory = new BrowserHistory();

      testHistory.push('/two'); // 1.0
      testHistory.push('/three'); // 2.0
      testHistory.push('/four'); // 3.0
      testHistory.push('/five'); // 4.0
      testHistory.push('/six'); // 5.0

      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.go(-2);

      setTimeout(() => {
        const calls = subscriber.mock.calls;
        const [ location, action ] = calls[calls.length - 1];
        expect(location).toMatchObject({
          pathname: '/four',
          key: '3.0'
        });      
        expect(action).toBe('POP');
        done();
      }, 10);
    });

    it('emits new location/action when the user confirms the navigation', (done) => {
      const testHistory = new BrowserHistory();
      testHistory.push('/two'); // 1.0
      testHistory.push('/three'); // 2.0

      testHistory.confirmWith((location, action, success, failure) => {
        success();
      });
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.go(-2);
      setTimeout(() => {
        expect(testHistory.location).toMatchObject({
          pathname: '/one',
          key: '0.0'
        });
        expect(subscriber.mock.calls.length).toBe(1);
        done();
      }, 10);
    });

    it('does not emit when the user does not confirm the navigation', (done) => {
      const testHistory = new BrowserHistory();
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
});
