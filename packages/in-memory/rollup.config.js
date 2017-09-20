import typescript from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';

const config = {
  entry: 'src/index.ts',
  moduleName: 'HickoryInMemory',
  sourceMap: true,
  globals: {
    '@hickory/root': 'HickoryRoot'
  },
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true
    }),
    resolve()
  ]
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(uglify());
}

export default config;
