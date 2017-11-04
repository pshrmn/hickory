import 'jest';
import InMemory from '../src';

describe('go', () => {
  it('does nothing if the value is outside of the range', () => {
    const testHistory = InMemory();
    const subscriber = jest.fn();
    testHistory.subscribe(subscriber);

    testHistory.go(10);

    expect(subscriber.mock.calls.length).toBe(0);
  });

  it('re-emits the current location if called with no value, but POPs', () => {
    const testHistory = InMemory();
    const subscriber = jest.fn();
    testHistory.subscribe(subscriber);

    testHistory.push('/next');
    testHistory.go();
    const [firstCall, secondCall] = subscriber.mock.calls;
    expect(secondCall[0]).toEqual(firstCall[0]);
    expect(secondCall[1]).toEqual('POP');
  });

  it('sets the new index/location using the provided number and emits', () => {
    const testHistory = InMemory({
      locations: ['/one', '/two', '/three', '/four', '/five']
    });

    const subscriber = jest.fn();
    testHistory.subscribe(subscriber);

    testHistory.go(3);
    const [ location, action ] = subscriber.mock.calls[0];
    expect(location).toMatchObject({
      pathname: '/four'
    });      
    expect(action).toBe('POP');
  });

  it('emits new location/action when the user confirms the navigation', (done) => {
    const testHistory = InMemory({
      locations: ['/one', '/two', '/three'],
      index: 2
    });

    const confirm = (info, confirm, prevent) => {
      confirm();
    };

    testHistory.confirmWith(confirm);

    function subscriber(location, action) {
      expect(location).toMatchObject({
        pathname: '/one',
        key: '0.0'
      });
      expect(action).toBe('POP');
      done();
    }
    testHistory.subscribe(subscriber);

    testHistory.go(-2);
  });

  it('does not emit when the user prevents the navigation', (done) => {
    const testHistory = InMemory({
      locations: ['/one', '/two', '/three'],
      index: 2
    });
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
    }, 10);
  });
});
