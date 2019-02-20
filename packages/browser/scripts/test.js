const execSync = require("child_process").execSync;

function run(command, extraEnv) {
  execSync(command, {
    stdio: "inherit",
    env: Object.assign({}, process.env, extraEnv)
  });
}

// integration tests
run("karma start --single-run");
