# Github Actions

## on 句ごとの違い

| Command                                               | `pull_request`        | `pull_request_target`  | `push`                 |
| ----------------------------------------------------- | --------------------- | ---------------------- | ---------------------- |
| `Branch Name<br/>git rev-parse HEAD`                    | `HEAD`                | `master`               | `master`               |
| `Commit Hash<br/>git rev-parse --abbrev-ref HEAD`       | (random)              | (latest master's hash) | (latest master's hash) |
| `echo $GITHUB_REF<br/>echo ${{ github.ref }}`           | `refs/pull/23/merge`  | `refs/heads/master`    | `refs/heads/master`    |
| `echo $GITHUB_REF_NAME<br/>echo ${{ github.ref_name }}` | `23/merge`            | `master`               | `master`               |
| `echo $GITHUB_HEAD_REF<br/>echo ${{ github.head_ref }}` | `my-feature-branch`   | `my-feature-branch`    | (N/A)                  |
| `echo $GITHUB_BASE_REF<br/>echo ${{ github.base_ref }}` | `master`              | `master`               | (N/A)                  |
| `Which yml file is used by Github Actions`              | yml in feature branch | yml in master branch   | yml in master branch   |

- 上記はマージ元が`my-feature-branch`でマージ先が`master`だった場合や、メインブランチが`master`だった場合の例
- `pull_request`と`pull_request_target`では、コンテキスト、Github Actions 実行の元となる yml ファイル、チェックアウトされるコードなど、すべてが違ってくる。
