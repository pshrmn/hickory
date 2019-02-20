function getDeps(pkg) {
  if (!pkg.dependencies) {
    return [];
  }
  return Object.keys(pkg.dependencies).map(key => key);
}

module.exports = getDeps;
