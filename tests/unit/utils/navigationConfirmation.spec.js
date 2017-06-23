import createNavigationConfirmation from '../../../src/utils/navigationConfirmation';

describe('createNavigationConfirmation', () => {
  describe('confirmWith', () => {
    it('registers the function passed to it', () => {
      const { confirmWith, confirmNavigation } = createNavigationConfirmation();
      const allowNavigation = jest.fn();
      const success = () => {};
      const failure = () => {};
      
      confirmWith(allowNavigation);
      expect(allowNavigation.mock.calls.length).toBe(0);
      
      confirmNavigation(null, null, success, failure);
      expect(allowNavigation.mock.calls.length).toBe(1);
    });
  });

  describe('removeConfirmation', () => {
    it('does not call confirmation function after it has been removed', () => {
      const {
        confirmWith,
        confirmNavigation,
        removeConfirmation
      } = createNavigationConfirmation();
      const allowNavigation = jest.fn();
      const success = () => {};
      const failure = () => {};

      confirmWith(allowNavigation);
      expect(allowNavigation.mock.calls.length).toBe(0);
      
      confirmNavigation(null, null, success, failure);
      expect(allowNavigation.mock.calls.length).toBe(1);

      removeConfirmation();
      confirmNavigation(null, null, success, failure);
      expect(allowNavigation.mock.calls.length).toBe(1);
    });
  });

  describe('confirmNavigation', () => {
    it('calls success function if there is no confirm function', () => {
      const {
        confirmWith,
        confirmNavigation,
        removeConfirmation
      } = createNavigationConfirmation();
      
      const success = jest.fn();
      const failure = jest.fn();

      confirmNavigation(
        { pathname: '/this-is-only-a-test' },
        'TEST',
        success,
        failure
      );
      expect(success.mock.calls.length).toBe(1);
      expect(failure.mock.calls.length).toBe(0);
    });

    it('calls the confirm function with the new location, action and success/failure fns', () => {
      const {
        confirmWith,
        confirmNavigation,
        removeConfirmation
      } = createNavigationConfirmation();
      
      const allowNavigation = jest.fn();
      const success = () => {};
      const failure = () => {};
      const loc = { pathname: '/this-is-only-a-test' };
      const action = 'TEST';

      confirmWith(allowNavigation);
      confirmNavigation(
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
