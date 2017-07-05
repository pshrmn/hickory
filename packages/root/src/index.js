import createSubscriptionCoordinator from './subscriptionCoordinator';
import createLocationUtils from './locationFactory';
import createKeyGenerator from './keygen';
import createNavigationConfirmation from './navigationConfirmation';

export default function Common(options) {
  return Object.assign({},
    createSubscriptionCoordinator(),
    createLocationUtils(options),
    createNavigationConfirmation(),
    { keygen: createKeyGenerator() }
  );
}
