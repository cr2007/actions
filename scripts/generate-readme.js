#!/usr/bin/env bun
// Regenerates README.md snippet blocks from the canonical files in examples/.
// Bun-native only: Bun.file/Bun.write for I/O, Bun.Glob for listing,
// import.meta.dir for paths. No Node built-ins and no external dependencies.
//
// Usage:
//   bun scripts/generate-readme.js         # rewrite README.md in place
//   bun scripts/generate-readme.js --check # exit 1 if README.md is stale (for CI)

const { renderSnippets } = require('./lib/readme-snippets.js');

const repoRoot = `${import.meta.dir}/..`;
const readmePath = `${repoRoot}/README.md`;
const examplesDir = `${repoRoot}/examples`;

async function loadExampleContents() {
  const contents = new Map();
  const glob = new Bun.Glob('*.yml');
  for await (const file of glob.scan(examplesDir)) {
    const name = file.replace(/\.yml$/, '');
    contents.set(name, await Bun.file(`${examplesDir}/${file}`).text());
  }
  return contents;
}

async function main() {
  const checkOnly = Bun.argv.includes('--check');
  const original = await Bun.file(readmePath).text();
  const exampleContents = await loadExampleContents();
  const regenerated = renderSnippets(original, exampleContents);

  if (checkOnly) {
    if (original !== regenerated) {
      console.error('README.md is out of date with examples/*.yml.');
      console.error('Run "bun scripts/generate-readme.js" and commit the result.');
      process.exit(1);
    }
    console.log('README.md is up to date.');
    return;
  }

  await Bun.write(readmePath, regenerated);
  console.log('README.md regenerated.');
}

await main();
