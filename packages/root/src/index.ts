export * from "./types";

import locationUtils from "./locationUtils";
import keyGenerator from "./keyGenerator";
import navigateWith from "./navigateWith";
import confirmation from "./confirmation";
import createBase from "./base";

// deprecated name
const navigationConfirmation = confirmation;

export {
  locationUtils,
  keyGenerator,
  confirmation,
  navigationConfirmation,
  navigateWith,
  createBase
};
