# Software Design 202505

## オブザーバビリティ

### 基本

オブザーバビリティはモニタリングの進化系。

テレメトリーデータとはシステムの状態を示すデータの総称で、以下の 4 つからなる。

- メトリクス
  - 時系列で「どのリソースがどれだけ」使われたかを計測する
- ログ
  - 個々のイベントを詳細に記録する
- トレース
  - リクエスト経路を可視化する
- プロファイル
  - どの関数でどれだけ CPU 時間やメモリを消費しているかを継続的に収集する

モニタリングではこれらの情報間の紐付けや連携は手動だったが、
オブザーバビリティでは自動で行われる。

オブザーバビリティの実現には、計装/収集/蓄積/活用の 4 ステップが必要である。

### ツールの選択

オブザーバビリティツールは以下のようなものがある。

商用だと、計装から活用までの必要な道具がすべて用意されていることが多い。

- New Relic
- Datadog
- Honeycomb
- Dynatrace
- AWS - CloudWatch
- Google Cloud - Cloud Operations

OSS だと以下のようなものがある。
ただしデータの蓄積と活用は、Grafana など単一のシステムで管理しないと
オブザーバビリティが実現できないので注意。

- メトリクス
  - Prometheus
  - Grafana Mimir (Prometheus 互換)
  - VictoriaMetrics
- ログの検索・保持
  - Elasticsearch
  - Grafana Loki
  - Victoria Logs
- ログの収集・変換・転送
  - Fluentd
  - Logstash
- トレース
  - Tempo
  - Jaeger
  - Zipkin
- プロファイル
  - Grafana Pyroscope

最近は OpenTelemetry という選択もある。
OpenTelemetry Protocol (OTLP) をやりとりする SDK やツールの総称。
これが常に正解というわけではなく、技術制約、コスト、運用などさまざまな観点から検討が必要。

### メトリクス

メトリクスとは、時系列で記録される定量的なデータである。
いつ問題が起き始めたのか、それがどう変化したのかをみることができる。
種類は以下の 4 つである。

- カウンター:
  - 増加し続ける
  - e.g. エラー数など
- ゲージ
  - 現在の状態を表す絶対値
  - e.g. CPU 使用率など
- ヒストグラム
  - あらかじめ定義したバケット（範囲）ごとに数を記録する
  - e.g. リクエスト処理時間とその数など

ラベル(e.g. Status code, HTTP Method など)をつけることでさらに詳細な分析ができる。
ただしカーディナリティに注意。これはラベルが取りうる値の種類の数のこと。
高いとコストが爆発したり分析が重くなったりする。
本当に必要なものに限って使用すると良い。

### ログ

アプリケーションログ、システムログ、監査ログ、パフォーマンスログ、アクセスログなど色々ある。

- 暗号めいた文章ではなく、人間に優しい文章で出す
- 分析に役に立ちそうな具体的な情報を含める
- トレース ID やスパン ID を含める
- センシティブな情報を取り除く
- 過剰な量のログを出さない
- JSON や logfmt 形式など、構造化ログで出す
- 1 つのイベントのログは 1 つのログで出す（複数あると前後入れ替わるよ）
- ログレベルを適切に設定する

### トレース

実行経路を追跡するためのデータ。
複数のサービスを横断して実行される処理を可視化するために活用する。

**スパン**は作業や操作の単位のこと。
任意の単位で分割できる。親子関係を持てる。

**トレース**は 1 つのリクエストの実行経路全体を指す。
複数のスパンから構成される。

**コンテキスト伝播**は、レースやスパンの識別子等をサービス間で受け渡す仕組みのこと。
HTTP ヘッダで受け渡される。

全てのトレースデータを保存すると膨大になるのでサンプリングを行う。
正常リクエストは確率で間引き、エラーリクエストは全て保持するなど。

メトリクスやログにトレース ID やスパン ID を含めることで、様々な切り口での調査が可能になる。

### Grafana

Grafana はシステム監視やデータ分析にためのプラットフォーム。

メトリクス、ログ、トレースなど多様なテレメトリーデータに対応。
OSS で提供され、基本機能は無料。
様々なデータソースに対応している。
PromQL や LogQL など、サービスごとに独自のクエリ言語が存在する。

### OpenTelemetry

OpenTelemetry / OTel は OSS のオブザーバビリティフレームワーク。
標準化そのものを目的としたプロジェクトである。
計装と収集にのみフォーカスしており、蓄積と活用は他のツールに任せている。

OpenTelemetry Collector は、データの受信・処理・送信を専属で行う独立したサービス。

W3C Trace Context はトレース情報を HTTP ヘッダで受け渡すための標準仕様。
traceparent ヘッダはトレース ID やスパン ID のやりとりに、
tracestate ヘッダはベンダ独自の情報をやりとりするために使用される。

ヘッドサンプリングはトレースの開始時点で、テイルサンプリングはトレースの終了時点でサプリングの決定を行う。
前者はシンプルだが、取りこぼしが多くなる。
後者は重要なデータを確実に拾いつつデータ量の削減ができる一方で、実装や運用は複雑になる。

計装には手動計装、ライブラリ計装、ゼロコード計装がある。後になるほど簡単だが自由度は下がる。

OpenTelemetry は、Provider とよばれるデータ生成と処理をグローバルに一元管理する司令塔により動作する。

- TracerProvider -> Exporter
  - トレースデータの生成と処理を担当
- MeterProvider -> Reader -> Exporter -> Temporality
  - メトリクスデータの生成と処理を担当
  - Reader: 一定間隔で送る or 命令時に送る
  - Temporality: 累積送る or 差分で送る
- LoggerProvider -> LogRecordProcessors -> Exporter
  - ロギングライブラリと OpenTelemetry を連携させるためのブリッジ的なもの
  - 単にコンテキストの付与を行う程度のことしかしない

### オブザーバビリティの Tips

CPU 使用率のような「原因」だけでなく、ページ表示までの時間のような「ユーザーにとって目にみえる症状」を監視することで、見逃しや不要な対応を減らす。

通知には、通知を受け取った人間が判断や行動をするためのマニュアルや情報へのリンクを含めることで、行動しやすくする。

トレースなどを活用したデータによるインサイトを活用し、属人性をなくす。

バージョンや Feature Flag の情報などをトレースに含めることで、リリースや変更の影響を分析しやすくする。

Real User Monitoring (RUM) などを活用する。
ユーザー ID などをトレース情報含めれば、フロントからインフラまで一気通貫で分析できる。
ただし [OpenTelemetry のブラウザ実装](https://opentelemetry.io/docs/languages/js/getting-started/browser/) はまだ実験段階である。

オブザーバビリティに関するバス係数(何人バスに轢かれたら破綻するか)を増やしていく。

旧技術からの移行時にはリフト＆シフトは避け、最初からベストプラクティスを選んだ方がいい。

## クラス設計

計算判断が単純であれば、以下のようなプログラミングスタイルがわかりやすく確実である。

- トランザクションスクリプト
  - 手続き的なスタイル
  - 個々のスクリプトは独立しているため、依存関係の複雑さは問題になりにくい
  - 一方で、コードの重複は増えがち
- テーブルモジュール
  - DB のテーブル単位でモジュール化するスタイル
  - フレームワークの恩恵を受けやすい

しかし計算判断が複雑な場合は、上記だと修正や拡張が難しくなるため、
独自のデータ型を作るアプローチが有効である。

標準のデータ型だけでロジックを記述する方法は危険である。容易に取り違えが起きるため。

契約プログラミングとは、事前条件と事後条件を明確に定義することを重視する方法のこと。

アプリケーションアーキテクチャには色々あるが、以下の 4 つに分離することはどれもほぼ共通している。

- 計算判断
  - 業務ルールに基づく計算ロジックや判定ロジック
  - e.g. ドメインモデル・エンティティ・ビジネスロジック
- アプリケーションサービス
  - アプリケーション機能の提供
  - e.g. ユースケース
- プレゼンテーション
  - 外部からのリクエストの受付
  - e.g. コントローラー
- データソース

依存関係は以下のようになる。

```mermaid
graph TD
    プレゼンテーション --> アプリケーションサービス
    データソース --> アプリケーションサービス
    アプリケーションサービス --> 計算判断
```

計算判断クラスには必要なメソッドだけを持たせることで、要点だけを表現する。
また、不変なクラスとして設計する。

アプリケーションサービスクラスは肥大化しないように、必要に応じて
別のクラス（プレゼン or データソース or 別のアプリケーションサービス）に細かく分けて組み立てていく。

以下のような現代的なクラス設計を心がけること。

- 可変ではなく不変なクラスを選択する
- エンティティより値を選ぶ
  - エンティティを一つの巨大クラスにまとめるのはナンセンス
  - エンティティの様々な側面ごとにクラスを分け、それらをクラスのプロパティに値として持つほうがよい
- 継承よりコンポジション
- 継承よりサブタイピング
  - interface とその実装クラス

## ドメイン解体新書 / ドメイン取得で公開される情報

WHOIS は GDPR の影響で縮小傾向である。
よりモダンな RDAP(HTTPS + JSON + 権限制御付き WHOIS)がその代替になってきている。

ドメインを手掛かりとして収集できる情報はいろいろある。

- DNS 設定情報
- IP アドレス
- サブドメインの存在
- 利用技術
- ドメイン、DNS の設定変更履歴
- ドメインの評価

これらはポートスキャンなどのように悪意ある利用のきっかけにもなるので、日頃から注意しておく必要がある。

## AI の最前線

2025/04 時点におけるコーディング用途では Claude Sonnet が強い。

いきなり実装タスクを投げるより、推論モデルでプランを立て、その後に実装タスクを投げるのが良い。
例えば Sonnet の推論モードでプランを立て、その後に通常モードで実装するなど。

## ソフトウェアテスト探検隊 / サンプリング（抜き取り）テストからどう一歩進めるか

- Example-Based Test (EBT)
  - いわゆる普通のテスト
  - わかりやすい
  - 一方で漏れがあるのとコード量が増えがち
- Parameterized / Table-Driven Test
  - for ループ的なのでテストを回すやつ
  - コード量を増やさずにケースを増やせる
  - 一方で、結局手書きなのでやっぱり漏れがある
- Property-Based Test (PBT)
  - 大量の入力を作ったうえで「性質」でテストをする
    - 性質とは、例えば引数を反転しても答えが同じとか、結果が昇順になるとか
  - 漏れを抑えられるが、テストの作成が若干難しい

## 実践データベースリファクタリング / 終わらないリファクタリング

リファクタリングのコツ

- 小さく初めてスコープを絞る
- 最後までやり切る覚悟を持つ
- 撤退のタイミングを見極める
  - 撤退基準を決めておく
- プロジェクトに期限をつける
  - うまいやりくりを誘発するため
- 破壊的な変更をしない
  - どうしても避けられない場合は準備と事後検証を抜かりなくやる
- 進捗を可視化する
  - テーブルやカラムにコメントをつけることで意図や理由を明示する (e.g. 何月何日に削除予定)
  - ドキュメント化する (e.g. [`tbls`](https://github.com/k1LoW/tbls)を使って CI でスキーマを自動生成する)
  - 変更履歴を残す (git 使ってれば問題ないね)
