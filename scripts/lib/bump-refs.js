// Pure string-rewriting logic for bumping the floating major-tag reference
// (e.g. "@v1") in workflow YAML content. No filesystem access here.
//
// Only touches `uses: cr2007/actions/...@vN` references pointing back at
// this repo, whether a composite action (cr2007/actions/name@vN) or a
// reusable workflow (cr2007/actions/.github/workflows/name.yml@vN).
// Third-party action references (actions/checkout, etc.) are untouched, and
// exact semver pins (@v1.2.3) are left alone since those are intentionally
// locked.

const TAG_REF = /(cr2007\/actions\/(?:\.github\/workflows\/[\w.-]+\.yml|[\w.-]+))@v(\d+)(?!\.\d)/g;

function normalizeMajor(input) {
  return input.replace(/^v/, '');
}

function bumpMajorRefs(content, newMajor) {
  return content.replace(TAG_REF, (_match, prefix) => `${prefix}@v${normalizeMajor(newMajor)}`);
}

module.exports = { bumpMajorRefs, normalizeMajor };
