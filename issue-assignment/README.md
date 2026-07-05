# issue-assignment

Composite action that lets repository collaborators self-serve issue
assignment via comments:

- `.take`: assign the issue to yourself
- `.release`: unassign yourself
- `.assign @user`: assign the issue to `@user`
- `.unassign @user`: remove `@user` from the issue's assignees

Only collaborators can trigger these commands (checked live via the GitHub
API), and comments on pull requests are ignored.

## Usage

```yaml
- uses: cr2007/actions/issue-assignment@v1
  with:
    comment-body: ${{ github.event.comment.body }}
    comment-author: ${{ github.event.comment.user.login }}
    issue-number: ${{ github.event.issue.number }}
    repository: ${{ github.repository }}
    is-pull-request: ${{ github.event.issue.pull_request != null }}
```

The calling job needs `permissions: issues: write`.

See [`examples/issue-assignment.yml`](../examples/issue-assignment.yml) for a full caller workflow, and the [repository README](../README.md) for versioning conventions and how this action fits alongside the other workflows here.

## Inputs

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `comment-body` | yes | | Body of the comment that triggered this action. |
| `comment-author` | yes | | Login of the user who posted the comment. |
| `issue-number` | yes | | Number of the issue the comment was posted on. |
| `repository` | yes | | Full `owner/repo` name of the repository. |
| `is-pull-request` | no | `"false"` | Set to `"true"` to skip processing (the comment was on a pull request, not an issue). |
