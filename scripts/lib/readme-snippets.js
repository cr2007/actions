// Pure snippet-substitution logic for README generation.
// Takes already-loaded content in and returns content out; no filesystem access,
// so this is unit-testable without touching real files.

const SNIPPET_START = /<!-- snippet:(\S+) -->/;
const SNIPPET_END = /<!-- \/snippet:(\S+) -->/;

// exampleContents: Map<name, string> of the raw content for each referenced snippet.
function renderSnippets(readmeContent, exampleContents) {
  const lines = readmeContent.split('\n');
  const output = [];
  let i = 0;

  while (i < lines.length) {
    const startMatch = lines[i].match(SNIPPET_START);

    if (!startMatch) {
      output.push(lines[i]);
      i++;
      continue;
    }

    const name = startMatch[1];
    output.push(lines[i]);
    i++;

    let foundEnd = false;
    while (i < lines.length) {
      const endMatch = lines[i].match(SNIPPET_END);
      if (endMatch && endMatch[1] === name) {
        foundEnd = true;
        break;
      }
      i++;
    }

    if (!foundEnd) {
      throw new Error(`Missing "<!-- /snippet:${name} -->" closing marker in README.md`);
    }

    if (!exampleContents.has(name)) {
      throw new Error(`Snippet "${name}" has no matching file at examples/${name}.yml`);
    }

    output.push('```yaml', exampleContents.get(name).trimEnd(), '```');
    output.push(lines[i]); // the closing marker line
    i++;
  }

  return output.join('\n');
}

module.exports = { renderSnippets };
