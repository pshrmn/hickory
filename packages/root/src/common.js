var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import createSubscriptionCoordinator from './subscriptionCoordinator';
import createLocationUtils from './locationFactory';
import createNavigationConfirmation from './navigationConfirmation';
import createKeyGenerator from './keygen';
export default function Common(options) {
    return __assign({}, createSubscriptionCoordinator(), createLocationUtils(options), createNavigationConfirmation(), createKeyGenerator());
}
