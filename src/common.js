import createSubscriptionCoordinator from './utils/subscriptionCoordinator';
import createLocationUtils from './utils/locationFactory';
import createKeyGenerator from './utils/keygen';
import createNavigationConfirmation from './utils/navigationConfirmation';

export default function(options) {
  return Object.assign({},
    createSubscriptionCoordinator(),
    createLocationUtils(options),
    createNavigationConfirmation(),
    { keygen: createKeyGenerator() }
  );
}