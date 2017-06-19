import History from '../../src/history';

describe('History', () => {
  describe('constructor', () => {

    it('sets expected default values', () => {
      const testHistory = new History();
      expect(Array.isArray(testHistory.locations)).toBe(true);
      expect(testHistory.locations.length).toBe(0);
      expect(testHistory.index).toBe(-1);
      expect(testHistory.location).toBeUndefined();
      expect(testHistory.path).toBeUndefined();
      expect(testHistory.confirm).toBe(null);
    })

    it('sets up subscription system', () => {
      const testHistory = new History();
      const loc = { pathname: '/this-is-only-a-test' };
      const action = 'TEST'
      testHistory.subscribe((l, a) => {
        expect(l).toEqual(loc);
        expect(a).toBe(action);
      });

      testHistory._emit(loc, action);
    });
  });

  describe('confirmWith', () => {
    it('registers the function passed to it', () => {
      const testHistory = new History();
      const allowNavigation = () => {};
      testHistory.confirmWith(allowNavigation);

      expect(testHistory.confirm).toEqual(allowNavigation);
    });
  });

  describe('removeConfirmation', () => {
    it('sets history.confirm to null', () => {
      const testHistory = new History();
      const allowNavigation = () => {};
      testHistory.confirmWith(allowNavigation);

      expect(testHistory.confirm).toBe(allowNavigation);
      testHistory.removeConfirmation();
      expect(testHistory.confirm).toBe(null);
    });
  });

  describe('confirmNavigation', () => {
    it('calls success function if there is no confirm function', () => {
      const testHistory = new History();
      const success = jest.fn();
      const failure = jest.fn();

      testHistory.confirmNavigation(
        { pathname: '/this-is-only-a-test' },
        'TEST',
        success,
        failure
      );
      expect(success.mock.calls.length).toBe(1);
      expect(failure.mock.calls.length).toBe(0);
    });

    it('calls the confirm function with the new location, action and success/failure fns', () => {
      const testHistory = new History();
      const allowNavigation = jest.fn();
      const success = () => {};
      const failure = () => {};
      const loc = { pathname: '/this-is-only-a-test' };
      const action = 'TEST';

      testHistory.confirmWith(allowNavigation);
      testHistory.confirmNavigation(
        loc,
        action,
        success,
        failure
      );
      const args = allowNavigation.mock.calls[0];
      expect(args[0]).toEqual(loc);
      expect(args[1]).toBe(action);
      expect(args[2]).toBe(success);
      expect(args[3]).toBe(failure);
    });
  });
});
