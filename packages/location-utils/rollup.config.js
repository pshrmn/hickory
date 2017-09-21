import typescript from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';

const config = {
  input: 'src/index.ts',
  name: 'HickoryLocationUtils',
  sourcemap: true,
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true
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
