import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';

const config = {
  entry: 'src/index.js',
  moduleName: 'HickoryDOMUtils',
  sourceMap: true,
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    })
  ]
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(uglify());
}

export default config;
