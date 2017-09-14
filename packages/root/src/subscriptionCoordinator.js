export default function subscriptionCoordinator() {
    var subscribers = [];
    function subscribe(fn) {
        var index = subscribers.push(fn) - 1;
        return function () {
            subscribers[index] = null;
        };
    }
    function emit(location, action) {
        subscribers.forEach(function (fn) {
            if (fn !== null) {
                fn(location, action);
            }
        });
    }
    function removeAllSubscribers() {
        subscribers = [];
    }
    return {
        subscribe: subscribe,
        emit: emit,
        removeAllSubscribers: removeAllSubscribers
    };
}
