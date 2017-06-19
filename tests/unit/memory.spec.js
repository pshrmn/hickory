import MemoryHistory from '../../src/memory';

describe('Memory history', () => {
  describe('constructor', () => {
    it('creates location/path creator functions', () => {
      const testHistory = new MemoryHistory();
      expect(typeof testHistory.createLocation).toBe('function');
      expect(typeof testHistory.createPath).toBe('function');
    });

    it('initializes with root location (/) if none provided', () => {
      const testHistory = new MemoryHistory();
      expect(testHistory.locations.length).toBe(1);
      expect(testHistory.index).toBe(0);
      expect(testHistory.location).toMatchObject({
        pathname: '/',
        hash: '',
        query: ''
      });
    });

    it('converts passed location values to location objects', () => {
      const testHistory = new MemoryHistory({
        locations: [
          '/one',
          { pathname: '/two' },
          [ '/three', { tres: 3 }]
        ]
      });

      expect(testHistory.locations.length).toBe(3);
      expect(testHistory.index).toBe(0);

      const [one, two, three] = testHistory.locations;
      expect(one).toMatchObject({
        pathname: '/one'
      });
      expect(two).toMatchObject({
        pathname: '/two'
      });
      expect(three).toMatchObject({
        pathname: '/three',
        state: { tres: 3 }
      });
    });

    it('sets the index if provided', () => {
      const testHistory = new MemoryHistory({
        locations: ['/one', '/two', '/three'],
        index: 2
      });
      expect(testHistory.index).toBe(2);
    });

    it('defaults to index 0 if provided value is out of bounds', () => {
      [-1, 3].forEach(value => {
        const testHistory = new MemoryHistory({
          locations: ['/one', '/two', '/three'],
          index: value
        });
        expect(testHistory.index).toBe(0);
      });
    });
  });

  describe('navigate', () => {
    it('pushes when given a location that creates a new path', () => {
      const testHistory = new MemoryHistory({
        locations: ['/first#test']
      });
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.navigate({ pathname: 'first', hash: 'not-a-test' });

      const args = subscriber.mock.calls[0];
      expect(args[1]).toBe('PUSH');
    });

    it('replace when given a new location that creates the same path', () => {
      const testHistory = new MemoryHistory({
        locations: ['/first#test']
      });
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.navigate({ pathname: 'first', hash: 'test' });

      const args = subscriber.mock.calls[0];
      expect(args[1]).toBe('REPLACE');
    });
  });

  describe('push', () => {
    it('pushes new location onto locations array', () => {
      const testHistory = new MemoryHistory();
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
      const testHistory = new MemoryHistory();
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
      const testHistory = new MemoryHistory();

      let [ initMajor ] = testHistory.location.key.split('.');
      initMajor = parseInt(initMajor, 10);

      testHistory.push('/next');

      const current = testHistory.location;
      let [ currentMajor, currentMinor ] = current.key.split('.');
      currentMajor = parseInt(currentMajor, 10);

      expect(currentMajor).toEqual(initMajor + 1);
      expect(currentMinor).toBe('0');
    });

    it('sets history.action to "PUSH"', () => {
      const testHistory = new MemoryHistory();
      testHistory.push('/next');
      expect(testHistory.action).toBe('PUSH');
    });
  });

  describe('replace', () => {
    it('pushes new location onto locations array', () => {
      const testHistory = new MemoryHistory();
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
      const testHistory = new MemoryHistory();
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
      const testHistory = new MemoryHistory();

      let [ firstMajor, firstMinor ] = testHistory.location.key.split('.');
      firstMinor = parseInt(firstMinor, 10);

      testHistory.replace('/same');
      let [ secondMajor, secondMinor ] = testHistory.location.key.split('.');
      secondMinor = parseInt(secondMinor, 10);

      expect(secondMinor).toBe(firstMinor + 1)
    });

    it('sets history.action to "REPLACE"', () => {
      const testHistory = new MemoryHistory();
      testHistory.replace('/same');
      expect(testHistory.action).toBe('REPLACE');
    });
  });

  describe('go', () => {
    it('does nothing if the value is outside of the range', () => {
      const testHistory = new MemoryHistory();
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.go(10);

      expect(subscriber.mock.calls.length).toBe(0);
    });

    it('re-emits the current location if called with no value', () => {
      const testHistory = new MemoryHistory();
      const subscriber = jest.fn();
      testHistory.subscribe(subscriber);

      testHistory.push('/next');
      testHistory.go();
      const [firstCall, secondCall] = subscriber.mock.calls;
      expect(secondCall[0]).toEqual(firstCall[0]);
      expect(secondCall[1]).toEqual(firstCall[1]);
    });

    it('sets the new index/location using the provided number and emits', () => {
      const testHistory = new MemoryHistory({
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
  });
});
