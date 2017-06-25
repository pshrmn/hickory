export default function createKeyGenerator(initial) {
  let id = initial || 0;
  let current;

  function parse(key) {
    return key.split('.').map(value => parseInt(value, 10));
  }

  return {
    major: function(after) {
      if (after) {
        let [ major ] = parse(after);
        id = major + 1;
      }
      return `${id++}.0`;
    },
    minor: function(current) {
      let [ major, minor ] = parse(current);
      return `${major}.${minor + 1}`;
    },
    diff: function(first, second) {
      const [ firstMajor ] = parse(first);
      const [ secondMajor ] = parse(second);
      return secondMajor - firstMajor;
    }
  }
}
