import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';

const config = {
  entry: 'src/index.js',
  moduleName: 'HickoryInMemory',
  sourceMap: true,
  globals: {
    '@hickory/root': 'HickoryRoot'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    }),
    resolve()
  ]
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(uglify());
}

export default config;
