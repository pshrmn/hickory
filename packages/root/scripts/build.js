const fs = require('fs');
const execSync = require('child_process').execSync;
const prettyBytes = require('pretty-bytes');
const gzipSize = require('gzip-size');

const buildStats = {}

const build = (name, command, extraEnv) => { 
  const buildStartTime = new Date();
  console.log('\nBuilding', name);
  execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv)
  });
  const buildEndTime = new Date();
  buildStats[name] = buildEndTime - buildStartTime;
}

const startTime = new Date();

build(
  'ES',
  'rollup -c -f es -o dist/hickory-root.es.js',
  {
    NODE_ENV: 'development',
    BABEL_ENV: 'build'
  }
);

build(
  'CommonJS',
  'rollup -c -f cjs -o dist/hickory-root.common.js',
  {
    NODE_ENV: 'development',
    BABEL_ENV: 'build'
  }
);

build(
  'UMD file',
  'rollup -c -f iife -o dist/hickory-root.js',
  {
    NODE_ENV: 'development',
    BABEL_ENV: 'build'
  }
);

build(
  'UMD min file',
  'rollup -c -f iife -o dist/hickory-root.min.js',
  {
    NODE_ENV: 'production',
    BABEL_ENV: 'build'
  }
);

const endTime = new Date();
const buildTime = endTime - startTime;

const size = fs.statSync('./dist/hickory-root.js').size;
const minSize = gzipSize.sync(
  fs.readFileSync('./dist/hickory-root.min.js')
);

console.log('Build time\n----------');
Object.keys(buildStats).forEach(key => {
  console.log('%s: %d seconds', key, buildStats[key]/1000);
});
console.log('Total: %d seconds', buildTime/1000);

console.log('\nFile Size\n---------');
console.log(
  'full umd: %s\n' + 
  'gzipped umd min: %s',
  prettyBytes(size),
  prettyBytes(minSize)
);
