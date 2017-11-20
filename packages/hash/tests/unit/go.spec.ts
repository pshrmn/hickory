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
describe('go', () => {
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
  
  describe('with no value', () => {
    it('calls response handler with current location and "POP" action', (done) => {
      const testHistory = Hash();
      const router = ignoreFirstCall(
        function(pending) {
          expect(pending.location).toMatchObject({
            pathname: '/one'
          });
          expect(pending.action).toBe('POP');
          done();
        }
      )
      testHistory.respondWith(router); // calls router
      testHistory.go();
    });
  });

  it('does nothing if the value is outside of the range', () => {
    const testHistory = Hash();
    const router = jest.fn();
    testHistory.respondWith(router);
    testHistory.go(10);
    // just verifying that a popstate event hasn't emitted to
    // trigger the history's event handler
    setTimeout(() => {
      expect(router.mock.calls.length).toBe(1);
    }, 5);
  });

  it('calls response handler with expected location and action', (done) => {
    const testHistory = Hash();
    let setup = false;
    function router(pending) {
      pending.finish();
      if (!setup) {
        return;
      }
      expect(pending.location).toMatchObject({
        pathname: '/four',
        key: '3.0'
      });      
      expect(pending.action).toBe('POP');
      done();
    }
    testHistory.respondWith(router);
    testHistory.push('/two'); // 1.0
    testHistory.push('/three'); // 2.0
    testHistory.push('/four'); // 3.0
    testHistory.push('/five'); // 4.0
    testHistory.push('/six'); // 5.0
    setup = true;
    testHistory.go(-2);
  });

  describe('respondWith', () => {
    describe('cancel', () => {
      it('undoes the pop if pushing before pending response finishes', done => {
        const testHistory = Hash();
        let setup = false;
        function initialRouter(pending) {
          pending.finish();
        }
        let cancelGo;
        const goRouter = ignoreFirstCall(
          function(pending) {
            // at this point, the Hash has popped
            expect(window.location.hash).toBe('#/four');
            cancelGo = pending.cancel;
            // trigger a push call and don't resolve the go
            testHistory.respondWith(pushRouter);
            testHistory.push('/seven');
          }
        );
        const pushRouter = ignoreFirstCall(
          function(pending) {
            cancelGo('PUSH');
            setTimeout(() => {
              expect(window.location.hash).toBe('#/six');
              done();
            }, 5);
          }
        );

        testHistory.respondWith(initialRouter);
        testHistory.push('/two'); // 1.0
        testHistory.push('/three'); // 2.0
        testHistory.push('/four'); // 3.0
        testHistory.push('/five'); // 4.0
        testHistory.push('/six'); // 5.0

        testHistory.respondWith(goRouter);
        testHistory.go(-2);
      });

      it('undoes the pop if replacing before pending response finishes', done => {
        const testHistory = Hash();
        let setup = false;
        function initialRouter(pending) {
          pending.finish();
        }
        let cancelGo;
        const goRouter = ignoreFirstCall(
          function(pending) {
            // at this point, the Hash has popped
            expect(window.location.hash).toBe('#/four');
            cancelGo = pending.cancel;
            // trigger a push call and don't resolve the go
            testHistory.respondWith(replaceRouter);
            testHistory.replace('/seven');
          }
        );
        const replaceRouter = ignoreFirstCall(
          function(pending) {
            cancelGo('REPLACE');
            setTimeout(() => {
              expect(window.location.hash).toBe('#/six');
              done();
            }, 5);
          }
        );

        testHistory.respondWith(initialRouter);
        testHistory.push('/two'); // 1.0
        testHistory.push('/three'); // 2.0
        testHistory.push('/four'); // 3.0
        testHistory.push('/five'); // 4.0
        testHistory.push('/six'); // 5.0

        testHistory.respondWith(goRouter);
        testHistory.go(-2);
      });

      it('does nothing if popping before pending response finishes', done => {
        const testHistory = Hash();
        let setup = false;
        function initialRouter(pending) {
          pending.finish();
        }
        let cancelGo;
        const goRouter = ignoreFirstCall(
          function(pending) {
            // at this point, the Hash has popped
            expect(window.location.hash).toBe('#/four');
            cancelGo = pending.cancel;
            // trigger a push call and don't resolve the go
            testHistory.respondWith(popRouter);
            testHistory.go(-1);
          }
        );
        const popRouter = ignoreFirstCall(
          function(pending) {
            cancelGo('POP');
            setTimeout(() => {
              expect(window.location.hash).toBe('#/three');
              done();
            }, 5);
          }
        );

        testHistory.respondWith(initialRouter);
        testHistory.push('/two'); // 1.0
        testHistory.push('/three'); // 2.0
        testHistory.push('/four'); // 3.0
        testHistory.push('/five'); // 4.0
        testHistory.push('/six'); // 5.0

        testHistory.respondWith(goRouter);
        testHistory.go(-2);
      });
    });
  });

  describe('with user confirmation', () => {
    it('calls response handler after the user confirms the navigation', (done) => {
      const testHistory = Hash();
      let setup = false;
      const router = ignoreFirstCall(
        function(pending) {
          pending.finish();
          if (!setup) {
            return;
          }
          expect(testHistory.location).toMatchObject({
            pathname: '/one',
            key: '0.0'
          });
          done();
        }
      );
      const confirm = (info, confirm, prevent) => {
        confirm();
      };
      testHistory.confirmWith(confirm);
      testHistory.respondWith(router);

      testHistory.push('/two'); // 1.0
      testHistory.push('/three'); // 2.0
      setup = true;
      testHistory.go(-2);
    });

    it('does not call response handler when the user prevents the navigation', (done) => {
      const testHistory = Hash();
      const confirm = (info, confirm, prevent) => {
        prevent();
      };
      function router(pending) {
        pending.finish();
      }
      testHistory.respondWith(router);
      
      testHistory.push('/two'); // 1.0
      testHistory.push('/three'); // 2.0
      // don't add function until we have setup the history
      testHistory.confirmWith(confirm);
      testHistory.go(-2);

      // need to wait for window.history.go to emit a popstate event
      setTimeout(() => {
        expect(testHistory.location).toMatchObject({
          pathname: '/three',
          key: '2.0'
        });
        done();
      }, 5);
    });
  });
});
