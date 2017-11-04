import 'jest';
import InMemory from '../src';

describe('navigate', () => {
  it('pushes when given a location that creates a new path', () => {
    const testHistory = InMemory({
      locations: ['/first#test']
    });
    const subscriber = jest.fn();
    testHistory.subscribe(subscriber);

    testHistory.navigate({ pathname: 'first', hash: 'not-a-test' });

    const args = subscriber.mock.calls[0];
    expect(args[1]).toBe('PUSH');
  });

  it('replace when given a new location that creates the same path', () => {
    const testHistory = InMemory({
      locations: ['/first#test']
    });
    const subscriber = jest.fn();
    testHistory.subscribe(subscriber);

    testHistory.navigate({ pathname: 'first', hash: 'test' });

    const args = subscriber.mock.calls[0];
    expect(args[1]).toBe('REPLACE');
  });
});
