import createLocationUtils from './locationFactory';
import { LocationMethods, LocationFactoryOptions } from './locationFactory';

import createNavigationConfirmation from './navigationConfirmation';
import { ConfirmationMethods } from './navigationConfirmation';

import createKeyGenerator from './keygen';
import { KeyMethods } from './keygen';

export type Options = LocationFactoryOptions;

export type CommonHistory = (
  LocationMethods &
  ConfirmationMethods &
  KeyMethods
);

export default function Common(options: Options): CommonHistory {
  return {
    ...createLocationUtils(options),
    ...createNavigationConfirmation(),
    ...createKeyGenerator()
  };
}
