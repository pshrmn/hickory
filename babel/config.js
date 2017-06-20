const envPreset = require('babel-preset-env').default;

const testing = process.env.BABEL_ENV === 'test';

const plugins = ['transform-export-extensions'];

if (!testing) {
  plugins.push('external-helpers');
}

module.exports = {
  presets:[
    ['env', {
      modules: testing ? 'commonjs' : false,
      targets: {
        browsers: ['> 1%']
      }
    }]
  ],
  plugins: plugins
};
