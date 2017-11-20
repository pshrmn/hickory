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
describe('push', () => {
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
      testHistory.push('/two');
      expect(window.location.hash).toBe('#/one');
    });
  });

  describe('respondWith', () => {
    it('triggers a response handler call', () => {
      const testHistory = Hash();
      const router = jest.fn();
      testHistory.respondWith(router); // calls router
      testHistory.push('/two');
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
        testHistory.push('/two?test=ing');
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
        testHistory.push({ pathname: '/two', hash: 'test' });
      });

      it('increments current major key value by 1, sets minor value to 0', () => {
        const testHistory = Hash();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router
    
        const [ initMajor ] = testHistory.location.key.split('.');
        const initMajorNum = parseInt(initMajor, 10);
    
        testHistory.push('/next');
    
        const current = testHistory.location;
        const [ currentMajor, currentMinor ] = current.key.split('.');
        const currentMajorNum = parseInt(currentMajor, 10);
    
        expect(currentMajorNum).toEqual(initMajorNum + 1);
        expect(currentMinor).toBe('0');
      });

      it('increments from current location\'s key when not at end of locations', (done) => {
        // async test because history.go needs to listen for a popstate event
        const testHistory = Hash();
        let afterPop = false;
        function router(pending) {
          pending.finish();
          if (pending.action === 'POP' && pending.location.pathname === '/three') {
            testHistory.push('/new-four');
            afterPop = true;
          }
          if (afterPop) {
            expect(testHistory.location.key).toBe('3.0');
            done();
          }
        }
        testHistory.respondWith(router); // calls router
        // just getting the history in the expected state
        testHistory.push('/two'); // 1.0
        testHistory.push('/three'); // 2.0
        testHistory.push('/four'); // 3.0
        testHistory.push('/five'); // 4.0
        testHistory.go(-2); // 2.0
      });
    });

    describe('action', () => {
      it('is "PUSH"', () => {
        const testHistory = Hash();
        const router = ignoreFirstCall(
          function router(pending) {
            expect(pending.action).toBe('PUSH');
            pending.finish();
          }
        )
        testHistory.respondWith(router); // calls router
        testHistory.push('/next');
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
        testHistory.push('/two');
      });
  
      it('does nothing if update is not called', () => {
        const testHistory = Hash();
        let call = 0;
        function router(pending) {}
        testHistory.respondWith(router); // calls router
        testHistory.push('/two');
        expect(window.location.hash).toBe('#/one');
      });

      it('sets history.location to new location object', () => {
        const testHistory = Hash();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router
        testHistory.push('/next');
        expect(testHistory.location).toMatchObject({
          pathname: '/next'
        });
      });

      it('sets history.action to "PUSH"', () => {
        const testHistory = Hash();
        function router(pending) {
          pending.finish();
        }
        testHistory.respondWith(router); // calls router
        testHistory.push('/next');
        expect(testHistory.action).toBe('PUSH');
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
        testHistory.push('/two');
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
        testHistory.push('/two');
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

      testHistory.push('/next');
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

      testHistory.push('/next');
      expect(router.mock.calls.length).toBe(1);
    });
  });
});
