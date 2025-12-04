# Inngest

## 概要

**Inngest** は、信頼性の高いバックグラウンドジョブを簡単に実装可能にしてくれる、フルマネージドなサービス。
例えば、リトライ、定期バッチ処理、複雑な順序を持つ処理、スケジューリング、
sagaパターンのような長時間トランザクションなどを、簡単に実装し管理できる。

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

**event**はアプリケーションのコードから明示的に発出したり、
webhook や APIリクエストを介して外部から受け取ったりする。

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

`step.invoke()`は、別のFunctionを呼び出す。
これにより、Functionをモジュール化し、再利用可能なコンポーネントとして設計できる。

`step.sendEvent()`はイベントを送信する。
結果を受け取らない非同期処理、いわゆるFan-outパターンに使える。

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
