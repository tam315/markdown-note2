# Github Actions

## pull_request と pull_request_target でのコンテキストの違い

| Command                       | `pull_request`            | `pull_request_target`      |
| ----------------------------- | ------------------------- | -------------------------- |
| `echo $GITHUB_REF`            | refs/pull/23/merge        | refs/heads/master          |
| `echo ${{ github.ref }}`      | refs/pull/23/merge        | refs/heads/master          |
| `echo ${{ github.ref_name }}` | 23/merge                  | master                     |
| `echo ${{ github.head_ref }}` | check-value (branch name) | check-value2 (branch name) |
| `echo ${{ github.base_ref }}` | master                    | master                     |

pull_request_target は、pull_request のマージ先ブランチの Github Actions の設定により動作するし、権限やコンテキストの値もマージ先ブランチのものになるっぽい。
