# Inngest

## 概要

**Inngest** は、信頼性の高いバックグラウンドジョブを簡単に実装可能にしてくれる、フルマネージドなサービス。
例えば以下のような、本来であれば非常に手間がかかることを、簡単に実装したり管理したりできるようになる。

- リトライ
- スケジューリング
- 定期バッチ処理
- バッチング (効率性のために複数のイベントを束ねて処理すること)
- 複雑な順序や条件分岐を持つ処理の構成
- 並列処理
- sagaパターンのような長時間トランザクション

基本的なコード例は以下のとおり。

```ts
inngest.createFunction(
  { id: 'send-welcome-email' },
  // Trigger
  { event: 'user.signup' },
  // Handler
  async ({ event, step }) => {
    const user = await step.run('get-user', () => getUser(event.data.userId))
    await step.run('send-email', () => sendEmail(user.email))
    await step.run('update-status', () => markEmailSent(user.id))
  },
)
```

**Funciton**(`inngest.createFunction()`) は、イベントやスケジュールをトリガーにして実行される処理の単位。
Functionの単位でFlow Control(Concurrency, Throttling, Rate Limitng, Debounce, Priority)を設定できる。

Functionは event または cron により**Trigger**される。

**Event**は、アプリケーションのコードから明示的に発出されたり、
Cron Jobにより発出されたり、
Inngestで作成したwebhookにより発出されたりする。

**Handler**は、Functionの定義において、あるeventに対応して実行されるコード全体のこと。
Handlerの中では event と step を扱える。

**Step**(`step.run`) は、Handlerの中で使用できる、Inngestにおける基礎的な処理の単位。

## Stepとは

複数の処理がある場合には、それぞれを Step として定義することが推奨される。
一つのstepが実行されるたびに、結果がInngestに永続化されるため、障害発生時に途中から再開できるからだ。
つまり、Step はコードレベルのトランザクションと捉えることができる。

どうやってInngestが状態を保存しているかというと、
[こんな感じ](https://www.inngest.com/docs/learn/how-functions-are-executed)である。要約すると以下の通り。

1. Inngestがアプリのinngestエンドポイントを叩く
2. Functionが最初のStepを実行し、結果（状態）を返す
3. Inngestがその状態を永続化する
4. Inngestが再度Functionを呼び出す。このとき、前回の状態を添付する。
5. Functionは状態を見て実行済みのStepをスキップし、次のStepを実行し、結果（状態）を返す
6. 3〜5を繰り返す

上記のように、Functionは何度も呼び出される可能性があるため、
非決定的なコードは必ずStep内に書く必要がある。

各Stepは後段の処理で利用するためのデータを返すことができる。
各Stepは冪等性を持ち、独立して実行できる必要がある。
Stepは、複数を同時に実行する（並列）ことも、順番に実行する（直列）こともできる。

`step.run()`はステップを実行する。
成功すれば結果をメモ化し、次回以降は実行せずにキャッシュされた結果を返す。
失敗すればリトライする。

`step.sleep()`は指定した時間ほど処理を止める。
`step.sleepUntil()`は指定した日時まで処理を止める。
2日間待つ、とか、明後日の正午まで待つ、みたいなことができる。

`step.waitForEvent()`は、指定したイベントが発生するまで処理を止める。
例えば、ユーザーがー最初のポストを作成するまで待つ、みたいなことができる。
タイムアウトも設定でき、そうなった場合は結果がnullになる。

`step.invoke()`は、別のFunctionを呼び出す。
これにより、Functionをモジュール化し、再利用可能なコンポーネントとして設計できる。

`step.sendEvent()`はイベントを送信する。
結果を受け取らない非同期処理、いわゆるFan-outパターンに使える。
信頼性が高いため、原則として`inngest.send()`よりもこちらの利用が推奨される。

## Inngestのユースケース

- **バックグラウンド関数**
  - メインの処理の外側で実行できる、パフォーマンスや信頼性を担保したい処理に最適
  - e.g. サードパーティ API の呼び出し
- **スケジュールされた関数**
  - 定期的に自動実行したい処理に最適
  - e.g. 週次レポートの送信、キャッシュのクリア
- **遅延された関数**
  - 特定の処理のちょっと後に実行したい、別の処理があるときに最適
  - e.g. フォローアップメールの送信、注文の遅延処理
- **ステップ関数**
  - 複雑なワークフローを構築したいときに最適
  - 他のイベントを待機したり、実行を遅延したり、イベントや前のステップしょ処理結果によって分岐したりなど
  - 各ステップが個別にリトライ可能で、失敗に強い
  - e.g. オンボーディングフロー、条件に基づいた通知の送信
- **ファンアウト関数**
  - 1 つのイベントで複数の関数を同時にトリガー
  - 並列処理に最適
  - e.g. 複数サービスへの通知送信、異なるシステム間でのデータ処理

## ローカル開発

CLIからDev Serverをローカルにサクッと起動して使う方法と、Dockerを介して使う方法がある。
Dockerを使う場合は以下のような設定が必要である。

```yaml
services:
  # My App
  app:
    build: ./app
    environment:
      - INNGEST_DEV=1 # Inngest SDKに対して開発環境であることを伝え、Dev Serverへの接続を促す
      - INNGEST_BASE_URL=http://inngest:8288 # デフォルトはlocalhostなので、SDKに正しいURLを手動で伝える
    ports:
      - '3000:3000'
  # Inngest dev server
  inngest:
    image: inngest/inngest:v0.27.0
    # Dockerを使う場合、アプリのInngestエンドポイントを自動検出することはできないので手動設定
    command: 'inngest dev -u http://app:3000/api/inngest'
    ports:
      - '8288:8288'
```

Functionsを手動テストするには、UIからボタンを押し、イベントデータを手入力して実行する。

Eventを手動でDev Serverに送信するには3つの方法がある。

- Inngest SDKを使ってコードを書いて実行する
- UIのTest Eventボタンを使う
- curlなどでHTTPリクエストを送る

`inngest.yaml`には、Inngestの設定が書ける。

## Events & Triggers

### イベントの送出

`inngest.send()`や`step.sendEvent()`により、
単一または複数のイベントを送出できる。
イベントIDは、処理状況を確認したりしたくなったときに使える。
await を忘れるとサーバーレス環境などで問題がおきがち。

```ts
const { ids } = await inngest.send([
  { name: 'app/user.created', data: { userId: '123' } },
  { name: 'app/email.sent', data: { to: 'user@example.com' } },
])
```

イベントの送出をするにはイベントキーが必要。
環境変数`INNGEST_EVENT_KEY`で設定することが推奨されている。

イベントは`https://inn.gs/***`なREST APIからも送ることができる。

### Eventのペイロードの形式

イベントのペイロードには`name`と`data`が必須。それ以外は任意。

- `id`は、イベントの重複排除をしたいときに使う
- `ts`は、タイムスタンプを明示的にセットしたいときに使う
- `v`は、ペイロードの形式をバージョニングして、コード側で処理分岐したいときに使う
- `user`は、ユーザーを特定するための情報を格納できる。保存時に暗号化される。

イベント名を名付けるときのコツ

- Object-Action patternを使う。`account.created`とか。
- 過去形で命名する
- ドットとアンスコで組み上げる。`blog_post.published`とか。
- Prefixを活用する。`api/user.created`,`stripe/customer.created`

### Crons

定期実行 x fan-outパターンはよく使う。
週次レポートを全ユーザーに送信するとか。

### Delayed Functions

`step.sleep()`や`step.sleepUntil()`により、実行を遅延できる。メリットは以下。

- 耐久性（Durable）
  - サーバー再起動、サーバーレス関数のタイムアウト、再デプロイがあっても、スケジュールされたジョブは失われないない
- 長期スケジュール対応
  - 有料プランで最大1年先、無料プランでも7日先までジョブを予約できる
- インフラ管理不要
  - キューやバックログを自分で管理する必要がない
- プラットフォーム非依存
  - AWS、Vercel、Cloudflare など、どの環境でも同じように動作する

### Direct Invocation

`step.invoke()`で他のFunctionを呼び出せる。

これにより、投げっぱなしにされたイベントからなる巨大なピタゴラスイッチを構成する代わりに、
一箇所にオーケーストレーション的なコードを書くことが可能になる。

また、Inngestには`app`という概念があるが、
`referenceFunction()`を活用することで、**別のappの関数をinvokeすることも可能**である。
これにより、分散システムやRPCの枠組みが容易に構築できる。
例えば、TS+Vercelの環境から、Python+AWSの関数を簡単に呼び出せる。

Edge環境とNode.js環境の差でエラーになる場合は[手当て](https://www.inngest.com/docs/guides/invoking-functions-directly#referencing-another-inngest-function)することで使える。

### Webhook

WebhookはEventを生成する主要な要素の一つだ。
InngestはWebhookのConsumerとして振る舞えるエンドポイントを、コンソールからいくつでも作ることができる。

- Provider: Webhookのイベントを送る人
- Consumer: Webhookのイベントを受け取って消費する人

Webhookのペイロード形式はプロバイダにより様々だが、
これをInngestで扱えるEventの形式に必ずTransformしてから取り込む必要がある。
具体的な方法は以下を参照。

https://www.inngest.com/docs/platform/webhooks

webhookはUIからだけではなく REST API により管理することも可能。
トランスフォーム周りのコードをコードベース上で管理＆同期したいときに便利だろう。

ローカル開発時には、UIから`Send to Dev Server`ボタンをポチッとすることで、
イベントをローカルに転送できる。
あるいはイベントを手動でコピーし、Dev Serverに貼り付けて`Send test`でも可能。

Webhookのプロバイダを検証したいときは、transformで署名等をeventに埋め込み、アプリ側で取り出して検証すること。

### よくあるパターン

**Fan-out**は、1つのトリガーをもとに、複数の関数を並列実行すること。
関数どうしは互いに独立しており、高い信頼性とパフォーマンスを得ることができる。
失敗時には、タイムレンジを指定してリトライすることも可能。

ユースケースとしては、例えばサインアップしたときに、ようこそメールを送り、Stripeにアカウントを作り、
CRMにユーザーを登録し、メーリングリストに追加する、を全部やる、みたいなのに使える。
あとは、分散システム的に他のシステムにデータを送る、みたいなのにも使える。

**Multiple triggers**は、1つの関数が複数のトリガーに反応すること。
`user.created`イベント発生時と、Cronによる定期実行の、両方で実行されるような関数を作ることができる。

**Wildcard event triggers** は、ワイルドカードを使って複数の関連イベントに反応する関数を作ること。
たとえば`stripe/*`で、Stripe関連のすべてのイベントに反応させられる。

**並列関数と並列ステップ**で迷ったときは、以下を参考にするとよい。

- 並列関数が最適なもの(イベントを送出して複数の関数でキャッチするパターン)
  - 後続の処理で個々の処理の結果が必要
  - 1000件以上の大量の並列処理
  - 個々の処理を独立してテストしたい
  - 個々の処理を個別にリトライしたい
- 並列ステップが最適なもの(Promise.allに複数ステップを渡すパターン)
  - 個々の処理の結果が不要
  - 1000件以下の少量の並列処理
  - 関数全体をまとめてテストできればいい
  - 関数全体をまとめてリトライできればいい

**イベントを送るか、関数を呼び出すか**で迷ったときは、以下を参考にするとよい。

- イベント送出が最適なもの
  - 独立した処理の、並列実行をしたいとき
  - 効率性の観点から、大量のイベントをバルク処理(batching)する必要があるとき
- 関数呼び出しが最適なもの
  - 複数の関数をコーディネートしながら実行したいとき(関数の結果が必要なとき)

**Batching**は、複数のイベントを1つの関数でまとめて処理して効率化を図るパターン。
ユースケースとして、(バルクリクエストに対応した)外部APIへのリクエストをまとめる、
DBへの書き込みをまとめる、Inngestからアプリケーションへのリクエストをまとめる、などがある。
Batcingは、Concurrencyと組み合わせられる。
逆に、idempotency, rate limiting, cancellation events, or priorityとは組み合わせられない。

Inngestでは、条件を設定する際や、動的に値を設定する場面で、**CELによるExpression** が使える。
詳細は[CEL Playground](https://playcel.undistro.io/)で試せる。

## Functions

### AI Inference

- `step.ai.infer()`
  - AIへのリクエストをInngestにオフロードすることで、サーバーレス環境の課金を減らすことができる
  - ストリーミングはいまのところできない(2025/12時点)
- `step.ai.wrap()`
  - SDKをラップして使うことで、コードを変えることなく、AIの使用量を把握するできるようにする
- AgentKit SDK
  - 一番進んだ書き方っぽい

### Fetch

`step.fetch()`や`fetch()`は、HTTPリクエストをInngestにオフロードする。

タイムアウトする可能性のあるHTTPリクエストを扱うときや、
並列リクエストを手軽に行いたいときに最適。
リクエスト結果はUIで確認できる。
そもそも、HTTPリクエストは不安定なので、Inngestに任せて耐久性を高めるべき

ただ、`fetch`の方は使うとコードが読みづらくなりそうなので、使わないほうが良さそう。
特に必要がない限り、シンプルに`step.fetch()`が良さそう。

### ループについて

InngestではFunctionが何度も実行される。
最初のStepが最初の保存状態になるわけではなく、
起動時にまずは**1個目のStepの直前まで**が実行され、状態が保存されるので注意。

```ts
inngest.createFunction(
  { id: 'simple-function' },
  { event: 'test/simple.function' },
  async ({ step }) => {
    console.log('hello')

    await step.run('a', async () => {
      console.log('a')
    })
    await step.run('b', async () => {
      console.log('b')
    })
    await step.run('c', async () => {
      console.log('c')
    })
  },
)

// "hello"
//
// "hello"
// "a"
//
// "hello"
// "b"
//
// "hello"
// "c"
```

`step.run()`をループ内で使いたいときは、[こんな感じ](https://www.inngest.com/blog/import-ecommerce-api-data-in-seconds)で、
ハンドラーのローカル関数を使うと良い。

### Retoolで内部用の管理画面をサクッと作る

例えば特定の関数をCSチームが再実行したい、みたいなときに便利。

https://www.inngest.com/docs/guides/trigger-your-code-from-retool

### Concurrency

用途としては大きく3種類ある。処理容量を超えないようにするために使うのがポイント。

- Basic Concurrency
  - 単に処理能力を超えないように制限したいとき
  - `cuncurrency`属性を設定
- Concurrency Keys
  - マルチテナントの公平性を保ちたいときなど
  - `cuncurrency`,`key`属性を設定
  - keyには`event.data.userId`などを設定する
- Sharing limits across Functions
  - DBや外部APIのスループットを制御したいときなど
  - `concurrency`,`key`,`scope`属性を設定
  - scopeには、環境ごとで区切るか、アカウント全体かを選べる
  - concurrencyは定数で管理して同じ数字を入れるように気をつけること

Concurrencyは**Stepの同時実行数**を見ている。
また、`step.sleep()`などしているものはカウントに入らない。
タスクはFIFOで実行され、手を付けたRunを早く片付くことが優先される。
関数内の特定のStepだけにConcurrencyを設定したいときは、そこを関数に切り出して行う。

### Throttling

`limit`,`period`,`key`属性を設定できる。
一定期間における関数の開始数を制限したいときに使う。
関数が走り出した後は、なにも制御されないないので注意。
制限数を超えたとしてもあくまで開始を遅らせるだけで、
必ず実行はされることが保証されている点がRate Limitingと異なる。

### Rate Limiting

`limit`,`period`,`key`属性を設定できる。
一定期間における関数の実行数を制限したいときに使う。
制限数を超えた場合、関数は実行されず捨てられる。
一定期間内の、**最初のイベント**を拾いたいときに使う。

### Debouncing

`period`,`key`,`timeout(任意)`属性を設定できる。
イベントがSettleする(periodを経過する)まで待ってから実行する。
一定期間内の、**最後のイベント**を拾いたいときに使う。
永遠にデバウンスされ続けるのを避けたいときには`timeout`を使う。

### Priority

`run`属性に評価式を書くことで、何秒分を優先させるかをセットできる。
通常はキューに突っ込まれた時刻順で処理されるが、
そこに強制的に割り込むことができるイメージ。
Concurrencyなどと組み合わせて使うと効果的。

### Errors & Retries

- **エラー（Error）**：ステップがリトライされる原因となるもの。リトライ回数を使い切ると「失敗」になる。
- **失敗（Failure）**：そのステップはもう再試行されない状態。`try`/`catch`で処理できるが、処理しないと関数全体が失敗し、UIで「Failed」と表示され、以降の実行もキャンセルされる。

デフォルトでは、初回実行とは別に、失敗時に最大4回の**Retry**が行われる。
リトライ回数はステップ単位で管理されており、ステップが進むごとに0にリセットされる。

Errorを継承するすべてのエラーはリトライされる。
もしリトライする意味がなく即時にFailさせたいときは、`NonRetriableError`を投げて行う。
リトライのタイミングは指数バックオフであるが、`RetryAfterError`を使えばカスタマイズも可能。

各ステップは、リトライを使い果たしてFailになったときに`StepError`を投げるため、
これをキャッチすることで**Rollback**処理を行うことができる。

失敗時の処理を書きたいときは、関数ごとに`onFailure`ハンドラーを設定して個別に対処するか、
`inngest/function.failed`をTriggerとする関数を定義することでグローバルに対処する。

### Idempotency

Idempotencyとは、何度呼ばれても、1回だけ呼ばれた時と同じ結果になることを指す。
Inngestでは、冪等性を確保する方法が2つある。

ひとつめは **Eventレベル(Producer側)** で行う方法。Eventに`id`を設定する。
こうすると同じIDのイベントが複数届いたとしても、関数は1回だけ実行される。
ただし、デバウンス、バッチングとは一緒に使えない。
例えば、チェックアウトボタンを押したときに、キーとして`orderId`を設定してイベントを送るなどして使える。

ふたつめは **Functionレベル(Consumer側)** で行う方法。
Functionの`idempotency`属性に、イベント情報を元に一意なキーを生成して設定する。
例えば、サインアップ時にようこそメールを送る関数であれば、`event.data.userId`をキーにすれば良い。

いずれも、24時間以内のみ有効である。

### Cancellation

関数の実行キャンセルは、API、ダッシュボード、イベント発行により行える。

実行中のステップは止められず、あくまで次のステップに進まないようにするだけである。
キャンセルした関数はUIからRetryが可能。

キャンセル時に手当が必要な場合は`inngest/function.cancelled`をTriggerとする関数を定義することで行うと便利。

イベントによるキャンセルは、関数に`cancelOn`属性を設定することで行う。

タイムアウトによるキャンセルも可能。
`timeouts.start`は、関数の最大待機時間(Concurrencyなどに起因してキューイングされている時間)を設定する。
`timeouts.finish`は、関数の最大実行時間を設定する。

長期に渡って実行される関数をまとめてキャンセルする必要がある場合は、
REST APIで行うか、またはUIから関数単位で行える。

### Versioning

関数は長時間実行されるため、sleepから再開した際などにコードが当初と比べて変更されている可能性がある。
このことをどう扱うかはInngestでは重要な問題であり、戦略は3つある。

- 既存の関数に単に新たにStepを追加する
  - 再開時に変更が検出された場合、警告ログが出力されたうえで、新しく追加したStepが実行される
  - たとえ新しいステップがすでに実行したステップより前にあっても、すでに実行したステップは再実行されない
  - すべてのステップがどんな順番で実行されてもよいことが前提
  - **strictモード** にすれば、変更があったときには必ず失敗とすることも可能。からのBulk-Replayで対処するのも一考。
- 既存の関数のStep IDを変更する
  - 再開時に変更が検出された場合、警告ログが出力されたうえで、必ず再実行される
- 新しく関数をつくる
  - 古い関数は条件にタイムスタンプを加えて、古いイベントだけを処理するようにする
  - 新しい関数は、同じイベントを拾って新しいロジックで処理するようにする

### Logging

ログするときに、重複を避けたり、サーバーレス環境を考慮したりする必要がないように、
あらかじめ`logger`オブジェクトが提供されているので、基本的にこれを使う。
設定により、pinoやwinstonなど、好きなロガーをベースとして使える。

## Realtime

またdeveloper previewの段階。以下のようなことを可能にするためのもの。

- Inngestの関数からユーザーへリアルタイムで更新をストリーミングできる
- ライブUI（リアルタイム更新されるインターフェース）を実現できる
- Human-in-the-Loop（人間が介在するワークフロー）のような双方向のワークフローを実装できる

InngestがWebSocketサーバーを用意してくれる。
Pusherなどを使わなくても良くなりそう。

## Middleware

ミドルウェア使うことで、ライフサイクルの各段階で処理を挟むことができる。
Inngestクライアントレベルか、Functionレベルで設定できる。
ログ、エラーハンドリング、データ変換などに使える。

`dependencyInjectionMiddleware`を使うとDIに使える。
OpenAIのクライアントをHandlerの引数で利用可能にするなど。

`encryptionMiddleware`を使うと、任意のフィールドを暗号化できる。
暗号化と復号化はアプリケーション側でのみ行われ、Inngest側には平文が渡らない。

## Deployment

アプリケーションサーバーをデプロイしたときには、Inngestクラウドとの手動同期が必要。
ただし、Vercelなどいくつかのプラットフォームでは自動同期が可能。

## Environment

Inngestには4種類の環境がある。

- Production Environment: 本番環境
- Branch Environment: ブランチごとの環境。Vercelのプレビュー環境などに対応する。
- Custom Environment: 独自に定義する環境。例えばstaging,QAなど。
- Local Environment: ローカル開発環境

ポイントは以下。

- 環境ごとに、データは完全に分離されている。
- 環境ごとに、Event KeysとSigning Keysが異なる。ただしBranch Environmentは利便性のためにすべて共通。
- 環境ごとに、複数のアプリケーションを紐づけられる。

**Branch Environment** を使うには、Inngestクライアントの`env`属性にブランチ名を設定する。
Vercelなら自動で行われる。
これがセットされていないと、イベントが正しい環境に送信されないので注意する。
Branch Environmentは3日でアーカイブされる。
