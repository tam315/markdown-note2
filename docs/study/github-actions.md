# Github Actions

## Custom Action

- `action.ya?ml`というファイルに書く
- 入出力インターフェースを定義する
    - `inputs`
        - variablesやsecretsには直接アクセスできないので、`inputs`で受け取る
    - `outputs`
- `secrets.GITHUB_TOKEN`が使えなくても、`github.token`でトークンにアクセスできる裏技がある
- バージョン番号のタグは、フルとメジャーバージョンだけの2種類を用意するのが慣例
- プライベートなactionsやReusable Workflows
    - リポジトリの範囲内でしか利用できない
    - `.github/actions/<action_name>/*.yml`あたりに置くのが一般的
    - 他のリポジトリから使う場合は、リポジトリのActionsの設定で`Accesible from repositories owned by HOGEHOGE`という明示的な許可が必要
- 公開するには専用リポジトリを作りメタデータファイルをルートに置く
- アクションをマーケットプレースにドラフト公開する際には、メタデータファイルで指定したカテゴリが実在するものである必要がある。
- 単一のジョブを`runs`として書くイメージ
- `runs.using`
    - composite(stepsを指定。お手軽)
    - node20(mainにJSファイルを指定)
    - docker(imageにドッカーファイルを指定)
- Composite Actions固有
    - 各ステップごとにシェルの明示的な指定が必須
    - stepsが長くなったら`run: "${{GITHUB_ACTION_PATH}}/script.sh"`のように外部スクリプトに切り出すと良い。相対パスでは動かないので注意。
- JavaScript Actions固有
    - ピュアなJSコードである必要があり、かつどのプラットフォームでも動作しないといけない
    - ランナー上で直接実行される
    - GitHub Hosted Runnerの場合、ランタイム(バイナリ)はプラットフォームごとに既定で用意され、自前で用意することはできない。
    - JSでアクションを書くときは`actions/toolkit`を使うと便利
- Docker Container Actions固有
    - 環境変数を渡すには、メタデータファイル(yml)の`runs.args`に値を列挙しておく。これによりDocker環境に環境変数が渡される。
    - 環境変数を確認するにはコンテナ内で`env`コマンドを使うと良い
        - ただし他者の作ったactionの場合はこの方法は使えないので別の方法で何とかする
    - ランナーはLinux環境である必要がある

## Reusable Workflows

- 提供側
    - 起動イベントを`on.workflow_call`にすることで作成できる
    - カスタムアクションのメタ版で、ワークフロー（≒複数のJob）までを記述できる
    - 通常のワークフローファイルと書き方はよく似ている
    - 置き場所
        - リポジトリ内だけで使うなら`.github/workflows/<name>.yml`に配置するのが一般的
        - リポジトリをまたいで使うなら、専用のリポジトリを作って組織内の全てのワークフローファイルをそこに配置すると良い
    - 入出力インターフェース(inputs,outputs,secrets)を定義できる
        - actionsでは秘匿情報を`inputs`で受け取ったが微妙に違う
        - secretsはここで定義したもののみ参照できる
        - 利用側の環境変数は参照できないので必ずinputsで受け取る
    - 値を出力するには、stepで出力、jobで出力、ワークフローで出力の三段階を踏む必要がある
- 利用側
    - 単一のジョブとして呼び出す書き方になる
    - 後段の処理が必要なら別ジョブとして定義する
    - `with`と`secrets`を指定する

## Templated workflows (Organization level)

- 組織の`.github`という**リポジトリ**の`workflow-templates`というフォルダに置く
- `<name>.yml`と`<name>.properties.json`の二つのファイルを作る
- `$default-branch`のようなプレースホルダを使えたりする

## ワークフローコマンド

ランナー環境を制御するためのコマンド

- `::`で囲まれたコマンドをエコーする
- e.g. `echo "::some-command arg1=value1,arg2=value2::<content>"`
- e.g. ログする
    - `echo "::debug file=aa,line=2::俺だよ俺俺"`
      ただしEnable Debug Loggingを有効にしているときにのみ表示される
- e.g. ログをグルーピングする
    - `echo "::group::<グループ名>"`
    - `echo "::endgroup::"`
- e.g. マスキングする
    - `echo "::add-mask::secret-value"` # クレデンシャルを動的に生成する時に役立つ
- e.g. アノテーションする
    - `echo "::error::error message"`
    - `echo "::warning::warning message"`
    - `echo "::notice::notice message"`
- e.g. 環境変数等をセットする
    - GITHUB_ENVやGITHUB_OUTPUTへの値のセットもワークフローコマンドの一種
    - `echo "HELLO=world" >> $GITHUB_ENV`

## GitHub Packages

- Dockerイメージの配布をするには
    - `docker/login-action`
    - `docker/meta-action`
        - バージョン番号、生成日時、コミットハッシュ、タグなどのメタデータを生成する
    - `docker/build-push-action`
        - Dockerfileからイメージをビルドしてpushする
        - メタデータはここで使う

## 終了ステータス関連

- `continue-on-error`はログを見ない限り失敗に気がつくことができないので注意、リカバリ不要な場合に使え
- matrixなjobはデフォルトでfail fastであり、一つ失敗すれば他も止まる
- 終了状態は、ステータスチェック関数に加え、`steps`や`needs`コンテキストでも取得することができる
    - stepsコンテキスト
        - outputs / ステップの出力
        - outcome / Continue on Error適用前
        - conclusion / Continue on Error適用後
    - needsコンテキスト
        - outputs / 依存ジョブの出力
        - result / 依存ジョブの終了状態
- if内でステータスチェック関数を省略すると、`success()`が存在するものとして扱われるという癖がすごい仕様なので注意

## ベストプラクティス

- `permissions: {}`をワークフローレベルでつけておくことで、ジョブレベルでの指定を必須にする
- ジョブにタイムアウトを指定しておく
- ジョブにconcurrencyを指定しておく

## Enterprise固有

- GitHub Enterprise Serverではセルフホストのランナーのみ使用可能。
- Github Enterprise Cloudでは、GitHub-hostedランナーとセルフホストランナーの両方を使用可能。
- Enterprise Serverには、GitHub謹製のActionsが含まれている。
    - パブリックなアクションのインストールを制限している場合は手動でActionをインストールする必要がおそらくあり、その際には`actions-sync`というCLIツールで行う。
- GitHub Actions use policy
    - どのアクションを使わせるか
    - Enterprise Levelでの設定である
- 共通して使用するカスタムアクション等は、一つのリポジトリにまとめたうえで、諸々のルールを定めておくとよい

## 各種関数

- `format('{0}が{1}になります','俺','俺俺')`
- `join((github.event.*.html_url, ','))`
- `toJSON(github)` # ダンプしたい時などに使う
- `matrix: ${{fromJSON(some.output.json)}}` # 動的にマトリックスを生成する時に使う

## サービスコンテナ

- CIにおけるDBなど、付随するサービスを使いたいときに指定する。
- `jobs.<job_id>.services`に指定する
- 以下の理由でdocker compose使ったほうが良さそう
    - 機能が足りているのか怪しい
    - ローカルで実行できない

## Self-hosted runner / Larger Runner

- Runner Group
    - 利用者を限定したり、コスト管理したりするために使う
    - ラベルと同時に指定できる（掛け算になる）
    - 作成したばかりのSelf-hosted Runnerはデフォルトグループに属す
- Self-hosted runner固有
    - ラベル
        - 特定の機能、用途や性能を表現できる
        - しかるべきアクションをそこにルーティングできるようになる
    - 複数ラベルを指定するとAND条件になる
    - self-hosted runnerはデフォルトで自動アップデートする。これはActionsの停止を招く。回避したい場合は無効化して自分でスケジュールする。
    - Self-hosted runnerをプロキシで保護された環境内で使うには、`https_proxy`,`http_proxy`,`no_proxy`などの環境変数をセットする。小文字推奨。
    - 疎通確認は`--check`で行える
    - GitHubに対して50秒のロングポーリング(WebSocketの弟分)を投げることで動作する

## 作業ディレクトリ

スクリプトを単一のフォルダにまとめている場合などに便利。

ジョブ全体に指定するとき

```yml
jobs:
  build-job:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
```

ステップ単位で設定するとき

```yml
- name: Build
  run: npm run build
  working-directory: functions
```

## アクション利用時のバージョン指定

- ブランチ指定は非推奨。コードが最新すぎてテストが未済の可能性があるため。
- メジャーバージョンのタグ指定が推奨
- 問題が起きた時だけ、より詳細なバージョン番号や、SHAを指定する。

## 未分類

- デフォルト値
    - actionの最長実行時間 6時間
    - Artifactの保存日数 90日
    - キャッシュの保存日数 7日
    - `GITHUB_TOKEN`の有効期限 ジョブ終了までもしくは発行から24時間
- Artifact
    - ワークフローレベルのページ（のArtifactセクション）に表示される。ジョブレベルのページではない。
    - `action/upload-artifact`
    - `action/download-artifact`
    - 保持期限を見たい時はAPIを叩くしかない
- ワークフローの状態・結果・ログを取得するためのAPIは「Checks API」
- ワークフローを開始・終了したり、ワークフローファイルを管理するためのAPIは「Actions API」
- `GITHUB_JOB_SUMMARY`環境変数にマークダウンをぶっ込むと、ジョブのサマリーに表示される。
- カスタムアクションをマーケットプレイスで公開する場合、アクション名が既存のカテゴリ名と重複してはならない。
- 規定の環境変数には`GITHUB_*`と`RUNNER_*`がある。`GITHUB_REPOSITORY`や`RUNNER_OS`など。
- "Set up job" and "Complete job"は必ず自動で実行される
- ランナーのIPを使った制限
    - GitHub-hosted runnersのIPは変わりまくるので、これで制限をかけるのは非推奨
    - larger runnersを固定IPで使うか、セルフホストランナーを使え
- ファイルパスを書くときはなるべくデフォルト環境変数を利用する。どの環境でも動くようになるため。
- 自前のスクリプトを使う場合、`chmod +x`で実行権限を与えることを忘れずに。（ローカルで一度設定してコミットしとけば、やらなくてもいい気がするけど）
- リポジトリにメンバーが加わったことをきっかけにアクション実行は今のとこできない
- yamlではtabによるインデントは使えない
- 文字列を使うときは、式(`${{}}`)を省略できる。逆に、式の中で扱う場合は`'`で囲む必要がある。`"`だとエラーになるので注意。
- オブジェクトフィルター
    - オブジェクトから特定のプロパティのみを抜き出して配列にする
    - 配列に対してもオブジェクトに対しても使える
    - `contains(github.event.issue.labels.*.name,'bug')`のように使う
- 最初のジョブに`if`を使うと、*ワークフロー全体*をスキップできる（ほんとか）
- `echo "<key>=<value>" >> $GITHUB_OUTPUT`でoutputをセットできる
- `echo "<key>=<value>" >> $GITHUB_ENV`で環境変数をセットできる（outputの方が明示的でいい）
- GitHub CLIを使うには、`GITHUB_TOKEN`または`GH_TOKEN`環境変数に`secrets.GITHUB_TOKEN`の値をセットしておく必要がある
- フィルタにより起動制御できる。ignoreと非ignoreは同時に使えない。
    - paths
    - paths-ignore
    - branches
    - branches-ignore
    - tags
    - tags-ignore
- アクティビティタイプはイベントの種類により異なる
    - e.g. `pull_request`の場合は`opened`, `closed`, `reopened`, `synchronize`など
- シェルはステップごとに独立しており、変更が可能
    - sh,bash,python,powershell,cmdなどが使える
    - デフォルトはbash
- デバッグログ
    - `ACTIONS_STEP_DEBUG`(ステップページから見れる)
    - `ACTIONS_RUNNER_DEBUG`（ダウンロードして見る）
    - これらの値はUIから設定できるほか、secretsもしくはvariablesにセットすることができる
- Job間で値を受け渡す手順
    - stepでGITHUB_OUTPUTに書き込む
    - ジョブのoutputsプロパティでGITHUB_OUTPUTの値を使ってセットする
    - 別ジョブにおいて`needs.<job_id>.outputs.<key>`で値を取得する
- cache
    - key 識別子
    - path キャッシュするディレクトリ
    - restore-keys keyでヒットしなかった場合に次善として使うキー
- キャッシュの上限は10GBまで
- actions/cacheは保存と復元の両方を行う。個別に行いたい場合はactions/cache/(save|restore)を使う
- 48KBを超えるシークレットを保存したい場合は、ファイル自体はGPGで暗号化してGit管理し、パスフレーズだけをシークレットとして扱うというワークアラウンドがある
- `npm publish`するときには`NODE_AUTH_TOKEN`にトークンをセットする必要がある。GitHub Registryを使う場合は単に`secrets.GITHUB_TOKEN`をセットすればよい。
- スケジュール実行は`on: schedule: cron`で設定する。
- matrix実行したいときは`strategy.matrix`を使う
    - `matrix.include`を使うと組み合わせを明示的に指定でき、組合せ爆発を防げる
- ランナーのパスを追加したい場合は、`echo "/tmp" >> $GITHUB_PATH`のようにする
- `on.create`は以下の場合に起動される
    - ブランチ作成時
    - タグ作成時(`on.tag`は存在しないよ)
    - コミット作成時
- ref関係
    - もともとGit Referenceとはブランチもしくはタグのことで、`tree .git.refs`で見れる
    - actionsでいうrefは微妙に拡張されているっぽい
    - push時
        - github.refで`refs/heads/branch-name`
        - github.ref_nameで`branch-name`
    - pull_request時
        - github.refで`refs/pull/123/merge`
        - github.ref_nameで`123/merge` (使わんやろ)
        - github.head_refでフィーチャーブランチ名
        - github.base_refでベースブランチ名
- カスタム環境変数の最も一般的な用途は、秘匿情報の格納
- `timeout-minutes`はジョブレベルだけでなくステップレベルでも設定できる
- アクション一覧画面で`Event`でフィルタすることで、PRだけとかPushだけとかを見れる
- ランナーの実行環境はジョブ単位で完全に独立している
- inputs(workflow_dispatchなどで使える)
    - 参照方法
        - `INPUT_<変数id>`という環境変数として
            - このとき変換処理があるので注意
                - スペースは`_`に、小文字は大文字に
                - `num-octocats`なら`INPUT_NUM-OCTOCATS`になる
        - `github.event.inputs.<変数id>`コンテキストの値としても取得できる。この時は変換処理はない。
    - 変数idは小文字で定義することが推奨されている
        - https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions#inputs
- runが削除できるようになるには条件がある
    - ワークフローが完了(成功、失敗、キャンセル)するか、２週間の経過が必要(後者の具体的なケースが何なのかは不明)
