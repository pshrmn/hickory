import typescript from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';

const config = {
  input: 'src/index.ts',
  name: 'HickoryRoot',
  sourcemap: true,
  globals: {
    '@hickory/location-utils': 'HickoryLocationUtils'
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