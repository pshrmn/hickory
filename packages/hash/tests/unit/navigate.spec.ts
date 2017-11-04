import "jest";
import Hash from '../../src';
import { jsdom } from 'jsdom';

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe('navigate', () => {
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

  it('pushes when given a location that creates a new path', () => {
    const testHistory = Hash();
    const subscriber = jest.fn();
    testHistory.subscribe(subscriber);

    testHistory.navigate({ pathname: 'next', hash: 'not-a-test' });

    const args = subscriber.mock.calls[0];
    expect(args[1]).toBe('PUSH');
  });

  it('replace when given a new location that creates the same path', () => {
    const testHistory = Hash();
    const subscriber = jest.fn();
    testHistory.subscribe(subscriber);

    testHistory.navigate({ pathname: '/one' });

    const args = subscriber.mock.calls[0];
    expect(args[1]).toBe('REPLACE');
  });
});
