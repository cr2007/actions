#!/usr/bin/env bun
// Rewrites the floating major-tag reference in every examples/*.yml file to
// a new major version. See scripts/lib/bump-refs.js for what gets matched.
//
// Bun-native only: Bun.Glob to list files, Bun.file/Bun.write for I/O,
// import.meta.dir for paths. No Node built-ins and no external dependencies.
//
// Usage:
//   bun scripts/bump-version-refs.js <newMajor>   # e.g. "v2" or "2"

const { bumpMajorRefs } = require('./lib/bump-refs.js');

const repoRoot = `${import.meta.dir}/..`;
const examplesDir = `${repoRoot}/examples`;

async function main() {
  const newMajor = Bun.argv[2];
  if (!newMajor) {
    console.error('Usage: bun scripts/bump-version-refs.js <newMajor>');
    process.exit(1);
  }

  const glob = new Bun.Glob('*.yml');
  let changedFiles = 0;

  for await (const file of glob.scan(examplesDir)) {
    const filePath = `${examplesDir}/${file}`;
    const original = await Bun.file(filePath).text();
    const updated = bumpMajorRefs(original, newMajor);

    if (updated !== original) {
      await Bun.write(filePath, updated);
      changedFiles++;
      console.log(`Updated ${file} -> @v${newMajor.replace(/^v/, '')}`);
    }
  }

  if (changedFiles === 0) {
    console.log(`No examples referenced a different major version than v${newMajor.replace(/^v/, '')}.`);
  }
}

await main();
