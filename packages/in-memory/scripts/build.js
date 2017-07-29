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

// don't bundle dependencies for es/cjs builds
const pkg = require('../package.json')
const deps = Object.keys(pkg.dependencies).map(key => key);
const depsString = deps.join(',');

build(
  'ES',
  `rollup -c -f es -o dist/hickory-in-memory.es.js -e ${depsString}`,
  {
    NODE_ENV: 'development',
    BABEL_ENV: 'build'
  }
);

build(
  'CommonJS',
  `rollup -c -f cjs -o dist/hickory-in-memory.common.js -e ${depsString}`,
  {
    NODE_ENV: 'development',
    BABEL_ENV: 'build'
  }
);

build(
  'UMD file',
  'rollup -c -f iife -o dist/hickory-in-memory.js',
  {
    NODE_ENV: 'development',
    BABEL_ENV: 'build'
  }
);

build(
  'UMD min file',
  'rollup -c -f iife -o dist/hickory-in-memory.min.js',
  {
    NODE_ENV: 'production',
    BABEL_ENV: 'build'
  }
);

const endTime = new Date();
const buildTime = endTime - startTime;

const size = fs.statSync('./dist/hickory-in-memory.js').size;
const minSize = gzipSize.sync(
  fs.readFileSync('./dist/hickory-in-memory.min.js')
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