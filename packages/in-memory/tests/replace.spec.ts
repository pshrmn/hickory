import 'jest';
import InMemory from '../src';

describe('replace', () => {
  it('pushes new location onto locations array', () => {
    const testHistory = InMemory();
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
    const testHistory = InMemory();
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
    const testHistory = InMemory();

    const [ firstMajor, firstMinor ] = testHistory.location.key.split('.');
    const firstMinorNum: number = parseInt(firstMinor, 10);

    testHistory.replace('/same');
    const [ secondMajor, secondMinor ] = testHistory.location.key.split('.');
    const secondMinorNum: number = parseInt(secondMinor, 10);

    expect(secondMinorNum).toBe(firstMinorNum + 1)
  });

  it('sets history.action to "REPLACE"', () => {
    const testHistory = InMemory();
    testHistory.replace('/same');
    expect(testHistory.action).toBe('REPLACE');
  });

  it('emits new location/action when the user confirms the navigation', () => {
    const testHistory = InMemory();
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
    const testHistory = InMemory();
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
