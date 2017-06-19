export default function createKeyGenerator(initial) {
  let id = initial || 0;
  let current;

  return {
    major: function(after) {
      if (after) {
        let [major, minor] = after.split('.');
        id = parseInt(major, 10) + 1;
      }
      return `${id++}.0`;
    },
    minor: function(current) {
      let [major, minor] = current.split('.');
      minor = parseInt(minor, 10) + 1;
      return `${major}.${minor}`;
    }
  }
}
