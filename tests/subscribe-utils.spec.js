import createSubscriptions from '../src/utils/subscribe';

describe('createSubscriptions', () => {

  describe('subscribe', () => {
    it('throws an error if passed a non-function', () => {
      const { subscribe } = createSubscriptions();
      const badValues = [
        null,
        undefined,
        0,
        1,
        'these',
        ['values', 'are'],
        { boundTo: fail }
      ];
      badValues.forEach(value => {
        expect(() => {
          subscribe(value);
        }).toThrow();
      });
    });

    it('adds function to subscribers list', () => {
      const { subscribe, emit } = createSubscriptions();
      let called = false;
      function mockSub() {
        called = true;
      }
      subscribe(mockSub);
      emit();
      expect(called).toBe(true);
    });

    describe('unsubscribe', () => {
      const { subscribe, emit } = createSubscriptions();
      let calls = 0;
      function mockSub() {
        calls++;
      }
      const unsub = subscribe(mockSub);
      emit();
      expect(calls).toBe(1);
      unsub();
      emit();
      expect(calls).toBe(1);
    });
  });

  describe('emit', () => {
    it('calls all subscribed functions', () => {
      const { subscribe, emit } = createSubscriptions();
      let count = 0;
      function increment() {
        count++;
      }
      for (let i=0; i<5; i++) {
        subscribe(increment);
      }
      emit();
      expect(count).toBe(5);
    });

    it('does not call unsubscribed functions', () => {
      const { subscribe, emit } = createSubscriptions();
      let count = 0;
      function plusOne() {
        count += 1;
      }
      function plusTwo() {
        count += 2;
      }
      function plusThree() {
        count += 3;
      }
      subscribe(plusOne);
      const unsub = subscribe(plusTwo);
      subscribe(plusThree);
      emit();
      expect(count).toBe(6);

      count = 0;
      unsub();
      emit();
      expect(count).toBe(4);
    });

    it('passes emit\'s arguments to the subscribers', () => {
      const { subscribe, emit } = createSubscriptions();
      const location = { pathname: '/magnitude' };
      const action = 'POP-POP';
      function logger(l, a) {
        expect(l).toEqual(location);
        expect(a).toEqual(action);
      }
      subscribe(logger);
      emit(location, action);
    });
  });
});
