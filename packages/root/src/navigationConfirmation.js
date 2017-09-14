function noop() { }
export default function createNavigationConfirmation() {
    var confirmFunction;
    function confirmNavigation(info, confirm, prevent) {
        if (!confirmFunction) {
            confirm();
        }
        else {
            confirmFunction(info, confirm, prevent || noop);
        }
    }
    function confirmWith(fn) {
        if (typeof fn !== 'function') {
            return;
        }
        confirmFunction = fn;
    }
    ;
    function removeConfirmation() {
        confirmFunction = null;
    }
    ;
    return {
        confirmNavigation: confirmNavigation,
        confirmWith: confirmWith,
        removeConfirmation: removeConfirmation
    };
}
