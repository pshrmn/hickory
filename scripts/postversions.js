const glob = require("glob");
const path = require("path");
const fs = require("fs-extra");
const git = require("simple-git")(process.cwd());

const root = process.cwd();

const packagesDir = path.join(root, "packages");

console.log("Updating CHANGELOG versions...");
// This relies on a README beginning with the string "## Next".
// If those aren't the first seven characters of the file, this
// will fail.
glob.sync(`${packagesDir}/**/CHANGELOG.md`).forEach(readme => {
  const buffer = fs.readFileSync(readme);
  if (buffer.indexOf("## Next") !== 0) {
    return;
  }

  const pathname = readme.substr(0, readme.indexOf("/CHANGELOG.md"));
  const pkg = require(`${pathname}/package.json`);
  const versionBuffer = Buffer.from(`## ${pkg.version}`);
  const output = Buffer.concat([versionBuffer, buffer.slice(7)]);

  fs.outputFileSync(readme, output);
  git.add(readme);
});
