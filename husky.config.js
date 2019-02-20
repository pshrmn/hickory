module.exports = {
  skipCI: true,
  hooks: {
    "pre-commit": "pretty-quick --staged"
  }
};
