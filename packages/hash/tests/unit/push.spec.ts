import "jest";
import Hash from '../../src';
import { jsdom } from 'jsdom';

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe('push', () => {
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

  it('pushes new location with incremented key', () => {
    const testHistory = Hash();

    const  [initialMajor] = testHistory.location.key.split('.');
    const initialMajorNum = parseInt(initialMajor, 10);

    testHistory.push('/next');

    const [replacedMajor] = testHistory.location.key.split('.');
    const replacedMajorNum = parseInt(replacedMajor, 10);

    expect(replacedMajorNum).toBe(initialMajorNum + 1);
    expect(testHistory.location).toMatchObject({
      pathname: '/next'
    });
  });

  it('appends hash symbol before pushing to browser', () => {
    const testHistory = Hash();
    testHistory.push('/next');
    expect(window.location.href).toBe('http://example.com/#/next');
  });

  it('emits the new location and action to any subscribers', () => {
    const testHistory = Hash();
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
    const testHistory = Hash();

    const [ initMajor ] = testHistory.location.key.split('.');
    const initMajorNum = parseInt(initMajor, 10);

    testHistory.push('/next');

    const current = testHistory.location;
    const [ currentMajor, currentMinor ] = current.key.split('.');
    const currentMajorNum = parseInt(currentMajor, 10);

    expect(currentMajorNum).toEqual(initMajorNum + 1);
    expect(currentMinor).toBe('0');
  });

  it('increments from current location\'s key when not at end of locations', (done) => {
    const testHistory = Hash();

    testHistory.push('/two'); // 1.0
    testHistory.push('/three'); // 2.0
    testHistory.push('/four'); // 3.0
    testHistory.push('/five'); // 4.0

    let calls = 0;
    let unsubscribe;
    function subscriber(location) {
      calls++;
      if (calls > 1) {
        unsubscribe();
        return;
      }
      testHistory.push('/new-four');
      expect(testHistory.location.key).toBe('3.0');
      done();
    }
    unsubscribe = testHistory.subscribe(subscriber);
    testHistory.go(-2); // 2.0
  });

  it('sets history.action to "PUSH"', () => {
    const testHistory = Hash();
    testHistory.push('/next');
    expect(testHistory.action).toBe('PUSH');
  });

  it('emits new location/action when the user confirms the navigation', () => {
    const testHistory = Hash();
    const subscriber = jest.fn();
    const confirm = (info, confirm, prevent) => {
      confirm();
    };
    testHistory.confirmWith(confirm);
    testHistory.subscribe(subscriber);

    testHistory.push('/next');
    expect(subscriber.mock.calls.length).toBe(1);
  });

  it('does not emit when the user prevents the navigation', () => {
    const testHistory = Hash();
    const subscriber = jest.fn();
    const confirm = (info, confirm, prevent) => {
      prevent();
    };
    testHistory.confirmWith(confirm);
    testHistory.subscribe(subscriber);

    testHistory.push('/next');
    expect(subscriber.mock.calls.length).toBe(0);
  });
});
