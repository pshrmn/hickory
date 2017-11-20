import "jest";
import InMemory from '../src';

function ignoreFirstCall(fn) {
  let notCalled = true;
  return function() {
    if (notCalled) {
      notCalled = false;
      return;
    }
    fn.apply(null, arguments);
  }
}

// We create our own jsdom instead of using the one that Jest will create
// so that we can reset the DOM between tests
describe('replace', () => {
  describe('without a response handler', () => {
    it('does nothing', () => {
      const testHistory = InMemory();
      testHistory.replace('/two');
      expect(testHistory.location.pathname).toBe('/');
    });
  });

  describe('respondWith', () => {
    it('triggers a response handler call', () => {
      const testHistory = InMemory();
      const router = jest.fn();
      testHistory.respondWith(router); // calls router
      testHistory.replace('/two');
      expect(router.mock.calls.length).toBe(2);
    });

    describe('location', () => {
      it('is a location object created from pushed string', () => {
        const testHistory = InMemory();
        const router = ignoreFirstCall(
          function(pending) {
            expect(pending.location).toMatchObject({
              pathname: '/two',
              query: 'test=ing'
            });
          }
        );
        testHistory.respondWith(router);
        testHistory.replace('/two?test=ing');
      });

      it('is a location object created from pushed object', () => {
        const testHistory = InMemory();
        const router = ignoreFirstCall(
          function(pending) {
            expect(pending.location).toMatchObject({
              pathname: '/two',
              hash: 'test'
            });
          }
        );
        testHistory.respondWith(router);
        testHistory.replace({ pathname: '/two', hash: 'test' });
      });

      it("key maintains current location's major value, increments the minor value", () => {
        const testHistory = InMemory();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router
    
        const [ initMajor, initMinor ] = testHistory.location.key.split('.');
        const initMajorNum = parseInt(initMajor, 10);
        const initMinorNum = parseInt(initMinor, 10);
    
        testHistory.replace('/next');
    
        const current = testHistory.location;
        const [ currentMajor, currentMinor ] = current.key.split('.');
        const currentMajorNum = parseInt(currentMajor, 10);
        const currentMinorNum = parseInt(currentMinor, 10);
    
        expect(currentMajorNum).toEqual(initMajorNum);
        expect(currentMinorNum).toBe(initMinorNum + 1);
      });
    });

    describe('action', () => {
      it('is "REPLACE"', () => {
        const testHistory = InMemory();
        const router = ignoreFirstCall(
          function router(pending) {
            expect(pending.action).toBe('REPLACE');
            pending.finish();
          }
        )
        testHistory.respondWith(router); // calls router
        testHistory.replace('/next');
      });
    });

    describe('finish', () => {
      it('updates InMemory history when finish function is called', () => {
        const testHistory = InMemory();
        let router = ignoreFirstCall(
          function (pending) {
            expect(testHistory.location.pathname).toBe('/');
            pending.finish();
            expect(testHistory.location.pathname).toBe('/two');
          }
        );
        testHistory.respondWith(router); // calls router
        testHistory.replace('/two');
      });
  
      it('does nothing if update is not called', () => {
        const testHistory = InMemory();
        let call = 0;
        function router(pending) {}
        testHistory.respondWith(router); // calls router
        testHistory.replace('/two');
        expect(testHistory.location.pathname).toBe('/');
      });

      it('sets history.location to new location object', () => {
        const testHistory = InMemory();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router
        testHistory.replace('/next');
        expect(testHistory.location).toMatchObject({
          pathname: '/next'
        });
      });

      it('sets history.action to "REPLACE"', () => {
        const testHistory = InMemory();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router
        testHistory.replace('/next');
        expect(testHistory.action).toBe('REPLACE');
      });
    });

    describe('cancel', () => {
      it('does not update InMemory history when cancel function is called', () => {
        const testHistory = InMemory();
        let router = ignoreFirstCall(
          function (pending) {
            expect(testHistory.location.pathname).toBe('/');
            pending.cancel();
            expect(testHistory.location.pathname).toBe('/');
          }
        );
        testHistory.respondWith(router); // calls router
        testHistory.replace('/two');
      });

      it('does not update the action value', () => {
        const testHistory = InMemory();
        let router = ignoreFirstCall(
          function (pending) {
            expect(testHistory.action).toBe('PUSH');
            pending.cancel();
            expect(testHistory.action).toBe('PUSH');
          }
        );
        testHistory.respondWith(router); // calls router
        testHistory.replace('/two');
      });
    });
  });

  describe('with a confirmation function', () => {
    it('calls response pending after the user confirms the navigation', () => {
      const testHistory = InMemory();
      const router = jest.fn();
      const confirm = (info, confirm, prevent) => {
        confirm();
      };
      testHistory.confirmWith(confirm);
      testHistory.respondWith(router); // calls router

      testHistory.replace('/next');
      expect(router.mock.calls.length).toBe(2);
    });

    it('does not call response pending when the user prevents the navigation', () => {
      const testHistory = InMemory();
      const router = jest.fn();
      const confirm = (info, confirm, prevent) => {
        prevent();
      };
      testHistory.confirmWith(confirm);
      testHistory.respondWith(router); // calls router

      testHistory.replace('/next');
      expect(router.mock.calls.length).toBe(1);
    });
  });
});
