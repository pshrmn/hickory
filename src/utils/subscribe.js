export default function subscribe() {
  let subscribers = [];

  function subscribe(fn) {
    if (typeof fn !== 'function') {
      throw new Error('The argument passed to subscribe must be a function');
    }
    // 
    const index = subscribers.push(fn) - 1;
    return function() {
      subscribers[index] = null;
    }
  }

  function emit(location, action) {
    subscribers.forEach(fn => {
      if (fn !== null) {
        fn(location, action);
      }
    });
  }

  return {
    subscribe,
    emit
  };
}