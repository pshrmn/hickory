import createNavigationConfirmation from '../src/navigationConfirmation';

describe('createNavigationConfirmation', () => {
  describe('confirmWith', () => {
    it('registers the function passed to it', () => {
      const { confirmWith, confirmNavigation } = createNavigationConfirmation();
      const allowNavigation = jest.fn();
      const confirm = () => {};
      const prevent = () => {};
      
      confirmWith(allowNavigation);
      expect(allowNavigation.mock.calls.length).toBe(0);
      
      confirmNavigation(null, confirm, prevent);
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
      const confirm = () => {};
      const prevent = () => {};

      confirmWith(allowNavigation);
      expect(allowNavigation.mock.calls.length).toBe(0);
      
      confirmNavigation(null, confirm, prevent);
      expect(allowNavigation.mock.calls.length).toBe(1);

      removeConfirmation();
      confirmNavigation(null, confirm, prevent);
      expect(allowNavigation.mock.calls.length).toBe(1);
    });
  });

  describe('confirmNavigation', () => {
    it('calls confirm function if there is no confirmation function', () => {
      const {
        confirmWith,
        confirmNavigation,
        removeConfirmation
      } = createNavigationConfirmation();
      
      const confirm = jest.fn();
      const prevent = jest.fn();

      confirmNavigation(
        {
          to: { pathname: '/this-is-only-a-test' },
          from: { pathname: '/this-was-not-a-test' },
          action: 'TEST'
        },
        confirm,
        prevent
      );
      expect(confirm.mock.calls.length).toBe(1);
      expect(prevent.mock.calls.length).toBe(0);
    });

    it('calls the confirm function with the info confirm/prevent fns', () => {
      const {
        confirmWith,
        confirmNavigation,
        removeConfirmation
      } = createNavigationConfirmation();
      
      const allowNavigation = jest.fn();
      const confirm = () => {};
      const prevent = () => {};
      const toLoc = { pathname: '/this-is-only-a-test' };
      const fromLoc = { pathname: '/this-was-not-a-test' };
      const action = 'TEST';

      confirmWith(allowNavigation);
      confirmNavigation(
        {
          to: toLoc,
          from: fromLoc,
          action  
        },
        confirm,
        prevent
      );
      const args = allowNavigation.mock.calls[0];
      expect(args[0]).toEqual({
        to: toLoc,
        from: fromLoc,
        action
      });
      expect(args[1]).toBe(confirm);
      expect(args[2]).toBe(prevent);
    });
  });

});
