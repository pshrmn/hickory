import 'jest';
import InMemory from '../src';

describe('push', () => {
  it('pushes new location onto locations array', () => {
    const testHistory = InMemory();
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
    const testHistory = InMemory();
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
    const testHistory = InMemory();

    const [ initMajor ] = testHistory.location.key.split('.');
    const initMajorNum = parseInt(initMajor, 10);

    testHistory.push('/next');

    const current = testHistory.location;
    const [ currentMajor, currentMinor ] = current.key.split('.');
    const currentMajorNum = parseInt(currentMajor, 10);

    expect(currentMajorNum).toEqual(initMajorNum + 1);
    expect(currentMinor).toBe('0');
  });

  it('increments from current location\'s key when not at end of locations', () => {
    const testHistory = InMemory({
      locations: ['/one', '/two', '/three', '/four', '/five'],
      index: 2
    });

    testHistory.push('/new-four');
    expect(testHistory.location.key).toBe('3.0');

  });

  it('sets history.action to "PUSH"', () => {
    const testHistory = InMemory();
    testHistory.push('/next');
    expect(testHistory.action).toBe('PUSH');
  });

  it('emits new location/action when the user confirms the navigation', () => {
    const testHistory = InMemory();
    const subscriber = jest.fn();
    const confirmer = (info, confirm, prevent) => {
      confirm();
    };
    testHistory.confirmWith(confirmer);
    testHistory.subscribe(subscriber);

    testHistory.push('/next');
    expect(subscriber.mock.calls.length).toBe(1);
  });

  it('does not emit when the user prevents the navigation', () => {
    const testHistory = InMemory();
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
