// this works, but needs to be improved
export default function createKeyGenerator(initial) {
  let id = initial || 0;
  let current;

  return function createKey(current) {
    if (current) {
      let [major, minor] = current.split('.');
      minor = parseInt(minor, 10) + 1;
      return `${major}.${minor}`
    } else {
      return `${id++}.0`;
    }
  };
}
