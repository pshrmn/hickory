import typescript from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';

const config = {
  entry: 'src/index.ts',
  moduleName: 'HickoryHash',
  sourceMap: true,
  globals: {
    '@hickory/location-utils': 'HickoryLocationUtils',
    '@hickory/root': 'HickoryRoot'
  },
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true
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
