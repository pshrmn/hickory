let glob = require("glob");
let path = require("path");
let fs = require("fs-extra");
let git = require("simple-git")(process.cwd());

let root = process.cwd();

let packagesDir = path.join(root, "packages");

console.log("Updating CHANGELOG versions...");
// This relies on a README beginning with the string "## Next".
// If those aren't the first seven characters of the file, this
// will fail.
glob.sync(`${packagesDir}/**/CHANGELOG.md`).forEach(readme => {
  let buffer = fs.readFileSync(readme);
  if (buffer.indexOf("## Next") !== 0) {
    return;
  }

  let pathname = readme.substr(0, readme.indexOf("/CHANGELOG.md"));
  let pkg = require(`${pathname}/package.json`);
  let versionBuffer = Buffer.from(`## ${pkg.version}`);
  let output = Buffer.concat([versionBuffer, buffer.slice(7)]);

  fs.outputFileSync(readme, output);
  git.add(readme);
});
