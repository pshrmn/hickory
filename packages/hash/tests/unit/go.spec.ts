import "jest";
import Hash from '../../src';
import { jsdom } from 'jsdom';

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe('go', () => {
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

  it('does nothing if the value is outside of the range', () => {
    const testHistory = Hash();
    const subscriber = jest.fn();
    testHistory.subscribe(subscriber);

    testHistory.go(10);

    expect(subscriber.mock.calls.length).toBe(0);
  });

  it('re-emits the current location if called with no value', () => {
    const testHistory = Hash();

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
    const testHistory = Hash();

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
    const testHistory = Hash();
    testHistory.push('/two'); // 1.0
    testHistory.push('/three'); // 2.0

    const confirm = (info, confirm, prevent) => {
      confirm();
    }

    testHistory.confirmWith(confirm);

    function subscriber(location) {
      expect(location).toMatchObject({
        pathname: '/one',
        key: '0.0'
      });
      done();
    }
    testHistory.subscribe(subscriber);

    testHistory.go(-2);
  });

  it('does not emit when the user prevents the navigation', (done) => {
    const testHistory = Hash();
    testHistory.push('/two'); // 1.0
    testHistory.push('/three'); // 2.0

    const confirm = (info, confirm, prevent) => {
      prevent();
    }
    testHistory.confirmWith(confirm);

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
    }, 100);
  });
});
