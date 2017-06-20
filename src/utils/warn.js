/*
 * This is similar to Facebook's warning, but flips the
 * condition so that we warn when the value is true. Warning
 * here are just used for developers, so this will be a no-op
 * in production. It also skips a bunch of the checks that warning
 * uses.
 */

function warn() {};

if (process.env.NODE_ENV !== 'production') {
  warn = function warn(condition, ...rest) {
    if (condition) {
      console.warn(...rest);
    }
  }
}



export default warn;
