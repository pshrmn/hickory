import "jest";
import Hash from '../../src';
import { jsdom } from 'jsdom';

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

  describe('without a response handler', () => {
    it('does nothing', () => {
      const testHistory = Hash();
      testHistory.replace('/two');
      expect(window.location.hash).toBe('#/one');
    });
  });

  describe('respondWith', () => {
    it('triggers a response handler call', () => {
      const testHistory = Hash();
      const router = jest.fn();
      testHistory.respondWith(router); // calls router
      testHistory.replace('/two');
      expect(router.mock.calls.length).toBe(2);
    });

    describe('location', () => {
      it('is a location object created from pushed string', () => {
        const testHistory = Hash();
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
        const testHistory = Hash();
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
        const testHistory = Hash();
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
        const testHistory = Hash();
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
      it('updates Hash history when finish function is called', () => {
        const testHistory = Hash();
        let router = ignoreFirstCall(
          function (pending) {
            expect(window.location.hash).toBe('#/one');
            pending.finish();
            expect(window.location.hash).toBe('#/two');
          }
        );
        testHistory.respondWith(router); // calls router
        testHistory.replace('/two');
      });
  
      it('does nothing if update is not called', () => {
        const testHistory = Hash();
        let call = 0;
        function router(pending) {}
        testHistory.respondWith(router); // calls router
        testHistory.replace('/two');
        expect(window.location.hash).toBe('#/one');
      });

      it('sets history.location to new location object', () => {
        const testHistory = Hash();
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
        const testHistory = Hash();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router
        testHistory.replace('/next');
        expect(testHistory.action).toBe('REPLACE');
      });
    });

    describe('cancel', () => {
      it('does not update Hash history when cancel function is called', () => {
        const testHistory = Hash();
        let router = ignoreFirstCall(
          function (pending) {
            expect(window.location.hash).toBe('#/one');
            pending.cancel();
            expect(window.location.hash).toBe('#/one');
          }
        );
        testHistory.respondWith(router); // calls router
        testHistory.replace('/two');
      });

      it('does not update the action value', () => {
        const testHistory = Hash();
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
      const testHistory = Hash();
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
      const testHistory = Hash();
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
