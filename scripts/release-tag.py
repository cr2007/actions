#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "git-cliff>=2.13.1",
# ]
# ///
"""Cut a release: bump the version with svu, update CHANGELOG.md with
git-cliff, tag, and publish a GitHub release.

Publishing the release (rather than just pushing a tag) is what triggers
release-readme-sync.yml, which reacts to the "release published" event.

Requires svu and gh on PATH; git-cliff is installed automatically by uv.

Usage:
  uv run scripts/release-tag.py <major|minor|patch>  # explicit bump
  uv run scripts/release-tag.py auto                 # derive bump with `svu next`

In "auto" mode, exits with status 10 (no error printed) if no commit since
the last tag warrants a release. The pre-push hook in .githooks/ relies on
this exit code to tell "nothing to do" apart from a real failure.
"""

import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
CHANGELOG = REPO_ROOT / "CHANGELOG.md"
NOTHING_TO_RELEASE = 10


def run(*args: str, capture: bool = False) -> str:
    result = subprocess.run(args, cwd=REPO_ROOT, check=True, text=True, capture_output=capture)
    return result.stdout.strip() if capture else ""


def main() -> None:
    if len(sys.argv) != 2 or sys.argv[1] not in ("major", "minor", "patch", "auto"):
        sys.exit("Usage: uv run scripts/release-tag.py <major|minor|patch|auto>")
    bump = sys.argv[1]

    if bump == "auto":
        next_version = run("svu", "next", capture=True)
        current_version = run("svu", "current", capture=True)
        if next_version == current_version:
            print("No commits since the last tag warrant a release.")
            sys.exit(NOTHING_TO_RELEASE)
        new_tag = next_version
    else:
        new_tag = run("svu", bump, capture=True)

    # Notes for the GitHub release: just this tag's unreleased commits.
    notes = run("git-cliff", "--unreleased", "--tag", new_tag, "--strip", "header", capture=True)

    # CHANGELOG.md: prepend the same section so it accumulates across releases.
    if not CHANGELOG.exists():
        CHANGELOG.write_text("")
    run("git-cliff", "--unreleased", "--tag", new_tag, "--prepend", str(CHANGELOG))

    run("git", "add", str(CHANGELOG))
    run("git", "commit", "-m", f"docs: update changelog for {new_tag}")

    run("git", "tag", "-a", new_tag, "-m", new_tag)
    run("git", "push", "origin", "HEAD", new_tag)

    # Move the floating major tag (e.g. "v1") to this commit, so consumers
    # pinned to "@v1" pick up the release. This is a force-push of just that
    # one tag, the same convention actions/checkout and similar use.
    major_tag = new_tag.split(".")[0]
    run("git", "tag", "-fa", major_tag, "-m", major_tag)
    run("git", "push", "origin", major_tag, "--force")

    # Publishing the release (not just pushing the tag) fires
    # release-readme-sync.yml's "release published" trigger.
    run("gh", "release", "create", new_tag, "--title", new_tag, "--notes", notes)

    print(f"Released {new_tag}")


if __name__ == "__main__":
    main()
