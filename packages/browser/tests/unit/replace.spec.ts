import "jest";
import Browser from '../../src';
import { jsdom } from 'jsdom';

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe('replace', () => {
  let dom;
  let window;

  beforeEach(() => {
    dom = jsdom('', {
      url: 'http://example.com/one'
    });
    window = global.window = dom.defaultView;
    global.document = dom;
  });

  afterEach(() => {
    dom.close();
    global.document = undefined;
  });

  it('replaces current location, but maintains major key', () => {
    const testHistory = Browser();

    const [initialMajor] = testHistory.location.key.split('.');
    const initialMajorNum = parseInt(initialMajor, 10);

    testHistory.replace('/same');

    const [replacedMajor] = testHistory.location.key.split('.');
    const replacedMajorNum = parseInt(replacedMajor, 10);

    expect(replacedMajorNum).toEqual(initialMajorNum);
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

    const [ firstMajor, firstMinor ] = testHistory.location.key.split('.');
    const firstMinorNum = parseInt(firstMinor, 10);

    testHistory.replace('/same');
    const [ secondMajor, secondMinor ] = testHistory.location.key.split('.');
    const secondMinorNum = parseInt(secondMinor, 10);

    expect(secondMinorNum).toBe(firstMinorNum + 1)
  });

  it('sets history.action to "REPLACE"', () => {
    const testHistory = Browser();
    testHistory.replace('/same');
    expect(testHistory.action).toBe('REPLACE');
  });

  it('emits new location/action when the user confirms the navigation', () => {
    const testHistory = Browser();
    const subscriber = jest.fn();
    const confirm = (info, confirm, prevent) => {
      confirm();
    };
    testHistory.confirmWith(confirm);
    testHistory.subscribe(subscriber);

    testHistory.replace('/same');
    expect(subscriber.mock.calls.length).toBe(1);
  });

  it('does not emit when the user prevents the navigation', () => {
    const testHistory = Browser();
    const subscriber = jest.fn();
    const confirm = (info, confirm, prevent) => {
      prevent();
    };
    testHistory.confirmWith(confirm);
    testHistory.subscribe(subscriber);

    testHistory.replace('/same');
    expect(subscriber.mock.calls.length).toBe(0);
  });
});