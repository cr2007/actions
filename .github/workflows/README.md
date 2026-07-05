# Workflows directory

Reusable workflows callable from other repositories, plus the workflows that maintain this repository itself.

## Callable from other repositories

### `gh-pages-deploy.yml`

Builds a static site and deploys it to GitHub Pages.

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `build-command` | no | `nr build` | Command to build the site. Runs after `ni` installs dependencies. |
| `output-dir` | no | `dist` | Directory containing the built site, relative to the repository root. |

### `typst-deploy.yml`

Compiles a Typst document to PDF and deploys it to GitHub Pages.

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `source-file` | yes | | Path to the Typst entry file to compile, relative to the repository root. |
| `output-file` | no | `document.pdf` | Name of the compiled PDF, as it will appear on the deployed Pages site. |
| `typst-version` | no | `latest` | Typst version range to install. |
| `extra-files-artifact` | no | (none) | Name of a workflow artifact from an earlier job, extracted into the repository root before compiling. For compile-time files that shouldn't be committed, e.g. a secrets-built `metadata.yml`. |
| `extra-site-files-artifact` | no | (none) | Name of a workflow artifact, extracted into the built site directory after compiling. For static files alongside the PDF, e.g. a landing `index.html`. |
| `lfs` | no | `false` | Whether to fetch Git LFS objects during checkout, for documents referencing LFS-tracked images or other binary assets. |

See the [repository README](../../README.md) for full example caller workflows and versioning conventions.

## Maintaining this repository

- [`test.yml`](./test.yml): runs `bun test` on every pull request and push to `main`.
- [`readme-check.yml`](./readme-check.yml): fails a pull request if [`README.md`](../../README.md) is out of date with `examples/*.yml`.
- [`release-readme-sync.yml`](./release-readme-sync.yml): on a published release that bumps the major version, updates [`examples/*.yml`](../../examples/) and `README.md` to the new tag and commits the result directly.
