# actions

Personal collection of reusable GitHub Actions, shared across repositories from this single source of truth.
Update an action or workflow here once; every repository that calls it picks up the change on its next run (or stays pinned, depending on which tag it references).

This repository holds two kinds of callable GitHub Actions, and they are
referenced differently:

- **Composite actions**: a single step you drop into a job you define
  yourself. Referenced as `uses: cr2007/actions/<name>@<version>`, pointing
  at a directory containing an `action.yml`.
- **Reusable workflows**: one or more full jobs, including their own `permissions` and `environment`.<br>Referenced as `uses: cr2007/actions/.github/workflows/<file>.yml@<version>`.<br>GitHub requires this exact path and file extension for reusable workflows; there is no shorthand for them.

Pin to a major tag (`@v1`) to get non-breaking fixes and features automatically, or to an exact tag (`@v1.2.0`) to lock a specific version.

## Index

- [`issue-assignment`](#issue-assignment-composite-action) (composite action): self-serve issue assignment via comments
- [`gh-pages-deploy.yml`](#gh-pages-deployyml-reusable-workflow) (reusable workflow): build and deploy a static site to GitHub Pages
- [`typst-deploy.yml`](#typst-deployyml-reusable-workflow) (reusable workflow): compile a Typst document to PDF and deploy it to GitHub Pages

---

## Available actions and workflows

### `issue-assignment` (composite action)

Lets collaborators self-serve issue assignment via comments:

- `.take`: assign the issue to yourself (no-op with a comment if already assigned)
- `.release`: unassign yourself
- `.assign @user`: assign the issue to `@user`
- `.unassign @user`: remove `@user` from the issue's assignees

All commands are restricted to repository collaborators, checked live via the GitHub API (no maintained allowlist required). Comments on pull requests are ignored.

Because this is a composite action rather than a reusable workflow, the calling repository defines its own job and grants it `issues: write` directly.

Example caller workflow:

<!-- snippet:issue-assignment -->
```yaml
name: Handle Issue Comments

on:
  issue_comment:
    types: [created]

permissions:
  contents: read

jobs:
  handle-comment:
    runs-on: ubuntu-latest
    permissions:
      issues: write
    steps:
      - uses: cr2007/actions/issue-assignment@v1
        with:
          comment-body: ${{ github.event.comment.body }}
          comment-author: ${{ github.event.comment.user.login }}
          issue-number: ${{ github.event.issue.number }}
          repository: ${{ github.repository }}
          is-pull-request: ${{ github.event.issue.pull_request != null }}
```
<!-- /snippet:issue-assignment -->

### `gh-pages-deploy.yml` (reusable workflow)

Builds a static site and deploys it to GitHub Pages.

Dependency installation and the build command are run through [`ni`](https://github.com/antfu-collective/ni), so the workflow works unmodified whether the consuming repository uses npm, yarn, pnpm, or bun. `ni` itself is installed globally with Bun.

Inputs:

- `build-command` (optional, default `nr build`): command used to build the site
- `output-dir` (optional, default `dist`): directory containing the built site

Example caller workflow:

<!-- snippet:gh-pages-deploy -->
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  call-reusable-workflow:
    permissions:
      contents: read
      pages: write
      id-token: write
    uses: cr2007/actions/.github/workflows/gh-pages-deploy.yml@v1
    with:
      build-command: nr build
      output-dir: dist
```
<!-- /snippet:gh-pages-deploy -->

### `typst-deploy.yml` (reusable workflow)

Compiles a [Typst](https://typst.app/) document to PDF and deploys it to GitHub Pages.

Inputs:

- `source-file` (required): path to the `.typ` entry file to compile
- `output-file` (optional, default `document.pdf`): name of the compiled PDF as it appears on the deployed site
- `typst-version` (optional, default `latest`): Typst version range to install

Example caller workflow:

<!-- snippet:typst-deploy -->
```yaml
name: Deploy Typst document to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  call-reusable-workflow:
    permissions:
      contents: read
      pages: write
      id-token: write
    uses: cr2007/actions/.github/workflows/typst-deploy.yml@v1
    with:
      source-file: main.typ
      output-file: document.pdf
```
<!-- /snippet:typst-deploy -->

## Maintaining this README

Copy-pasteable examples above are generated from the canonical files in [`examples/`](./examples), not hand-written, so they can't silently drift from what actually works.

If you change an example's inputs or the version tag it references:

```bash
bun scripts/generate-readme.js
```

CI runs the same script with `--check` on every PR and fails if `README.md`
doesn't match what regenerating it would produce.

## Versioning

Tags follow semver:

- **major** (`v1` to `v2`): a breaking change to an action's or workflow's inputs (rename/remove/retype an input, remove a command)
- **minor** (`v1.0.0` to `v1.1.0`): a backward-compatible addition (new command, new optional input)
- **patch** (`v1.0.0` to `v1.0.1`): a fix with no interface change

Each release also moves the floating major tag (e.g. `v1`) forward so consumers pinned to it pick up the update automatically.
