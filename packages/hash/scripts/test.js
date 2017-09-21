const fs = require('fs');
const execSync = require('child_process').execSync;

const buildStats = {}

function run(command, extraEnv) {
  execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv)
  });
}

// unit tests
run('jest');

// integration tests
run('karma start --single-run');
