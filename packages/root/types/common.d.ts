import { LocationMethods, LocationFactoryOptions } from './locationFactory';
import { ConfirmationMethods } from './navigationConfirmation';
import { KeyMethods } from './keygen';
export declare type Options = LocationFactoryOptions;
export declare type CommonHistory = (LocationMethods & ConfirmationMethods & KeyMethods);
export default function Common(options: Options): CommonHistory;
