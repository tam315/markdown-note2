# Software Design 202307

## ペアプロ・モブプロ

- スキルの高い側は：
  - 発言のハードルを下げる
    - 例えば
      - 理解度を確認する
      - 判断を委ねてみる
      - 感謝する（聞かれて逆に理解深まったよ的な）
    - スキルの低い側が遠慮して喋らなくなってしまいがちだから
  - 弱みを見せる
    - わからない、と率直に言うことでハードルを下げておく
- スキルの低い側は：
  - 積極的に質問する
    - 能動的にアクションして得た知見は記憶に残るから
  - 優先的にドライバーをやる
    - 分かっている人がドライバーだと理解が不十分なままスラスラ進んじゃうから
- 共通認識を持つ
  - どんな発言もチームにとって価値があること
- ペアプロ・モブプロをやったほうがいい兆候
  - 「聞いてくれればすぐわかったのに」
  - レビュー段階にて、そもそも設計が不適切だったことが発覚する
  - レビュー指摘後に問題が修正されていない、手戻りが何度も発生する
- 一時的なモブプロ・ペアプロも有効
  - 最初の 30 分だけペアプロする
  - 難しい技術課題が見つかったときだけする

## gRPC で始める Web API 開発

### gRPC の特徴と登場背景

- gRPC とは
  - 手元のプログラムから遠隔地に存在するプログラム処理の呼び出しを行う技術
- IDL
  - インターフェースの定義に使用できる言語
  - 特定のプログラミング技術に依存しない
- Protocol Buffer
  - gRPC で採用されている IDL
  - Protocol Buffer により記載した、サービス・メソッド・メッセージの定義を元に、API クライアント(Stubs ともいう)が自動生成される。
- Protocol Buffer の役割
  - インターフェースの定義をする
  - データのシリアライズ・デシリアライズをする
    - 各プログラミング言語のデータ構造と対応する形でデータをシリアライズ・デシリアライズできる
    - これにより、お互いの言語を気にする必要が完全になくなる
    - シリアライズ等の処理は API クライアントに隠蔽されているので意識することはない
- protoc
  - IDL からコードを生成するコンパイラ

#### サービスやメソッドの定義の例

- サービス
  - RPC メソッドの集合
- メソッド
  - メソッドごとにリクエストとレスポンスの型を指定する
  - リクエストとレスポンスのことをメッセージという

```grpc
service ProductManagement {
  rpc GetProduct(GetProductRequest) returns (GetProductResponse) {}
  rpc ListProducts(ListProductsRequest) returns (ListProductsResponse) {}
  rpc CreateProduct(CreateProductRequest) returns (CreateProductResponse) {}
  rpc UpdateProduct(UpdateProductRequest) returns (UpdateProductResponse) {}
  rpc DeleteProduct(DeleteProductRequest) returns (DeleteProductResponse) {}
}
```

#### メッセージの定義の例

- 型、名前、フィールド番号（タグナンバーからなる）

```grpc
message GetProductRequest {
  uint64 product_id = 1;
}

message GetProductResponse {
  Product product = 1;
}

message Product {
  uint64 product_id = 1;
  string name = 2;
  string description = 3;
  uint64 price = 4;
}
```

#### gRPC の特徴

- RPC フレームワークである
  - 「フレームワーク」なので、API と Client の間でやるべきことをほとんど代わりにやってくれる
  - 技術選定や実装の幅を減らすことで：
    - 強い規約が不要になる
    - メンバーのキャッチアップコストが減る
    - ライブラリのメンテナンスコストが減る
- 現代的
  - 現代的な開発体験
    - 自動生成されるコード
    - 型チェック
    - IDE 補完
    - インターセプター
      - middleware ともいう
      - ロガー・認証・分散トレーシングの実装が容易
    - API の段階的な変更・リリース
    - メッセージの自動バリデーション
  - 現代的な技術
    - HTTP/2
      - 高効率
      - ストリーミングの実装が容易
  - 現代的アーキテクチャ(マイクロサービス)との相性の良さ
- 高効率
  - JSON よりも小さい
- どんな環境でも動作する
  - 言語・プラットフォームに依存しない
  - （ただしブラウザではいまいち使えないらしい）
- オープンソース

#### gRPC のデメリット

- HTTP/2 に対応していないレイヤーがあると使えなかったり面倒だったりする
- デバッグ難易度が高い
  - バイナリなのでネットワークタブは使えない
  - grpccurl など専用ツールが必要
  - REST 等と比較して情報が少ない

#### 登場の背景

- Stubby という、Google 社内で使われていた高パフォーマンスな RPC フレームワークがあった
- これを標準技術を活用する形で作り直し、オープンソースとして公開したもの
- 主眼は「パフォーマンス」

#### 他の技術との比較

- REST API
  - CRUD の枠に収まらない昨日の開発を行う際、メソッドの設計にある程度の幅がある。gRPC にはその迷いはない。
  - 一方、キャッシュを聞かせる場合は REST API が楽（GET リクエストは全てキャッシュ、とか）
- GraphQL
  - GraphQL はラウンドトリップ回数を削減してパフォーマンス向上を図る
  - クライアントでの複雑かつ柔軟なデータ取得が重要な場合に向いている
  - 双方向ストリーミングの機能は無い

#### ブラウザでの利用

一筋縄ではいかず、以下のいずれかが必要

- gRPC-Web
  - ブラウザは HTTP/2 に対応していない場合もあるので、HTTP/1.1 に変換するために Envoy Proxy なるものを内部的に使っている
- gRPC-Gateway
  - protoc のプラグインである
  - gRPC との通信を REST API 風の Web API に変換するプロキシサーバを出力する
  - メッセージは JSON になる
  - Protocol Buffer のスキーマから OpenAPI のスキーマ生成も可能
- Connect
  - Buf という gRPC ラブな会社が作っている、gRPC のスーパーセット的なものらしい
  - とても有力な選択肢だが、2023/5 時点で connect-web はまだ正式リリース前な点に注意

#### その他

- protoc-gen-doc
  - コメントを基に Markdown や HTML などで出力できるツール

(その他の項目は必要になったら読む)

## 瞑想

- 科学的に明らかな効果あり
  - ストレスと不安の解消
  - 集中力や意思決定力の向上
  - 想像力の向上
  - 睡眠の質の向上
- やり方
  - 座る
  - 背筋伸ばす
  - 肩の力抜く
  - 軽く目を閉じる
  - ゆっくり呼吸する
  - 今＆呼吸に意識を向ける
  - 鼻から吸って口から吐く
  - 考えが浮かんでも OK、再び意識を呼吸に戻す
  - 5 分からはじめる

## GoF デザインパターン

一部は現代でも役立つ

- Proxy
  - Remote Proxy
    - 離れた場所にあるものを使えるようにする
  - Virtual Proxy
    - ハイコストなものを使いやすくする
      - キャッシング
      - 遅延初期化
  - Protection Proxy
    - アクセス制御
- Iterator
  - リスト等において中身を明かさずに要素にアクセスできるようにする
- Observer
  - ある値の変更に付随して別の箇所の値を変更する
- Singleton
  - 1 つだけインスタンスを作る
- Composite
  - 階層的な構造を扱うためのデザインパターン
  - 個々のオブジェクトとその集合のオブジェクトを同一視する
  - 個々のオブジェクトとオブジェクトの集合を同一の方法で操作可能にする

以下などは C++的オブジェクト指向の遺物っぽい。今は関数が一級市民だからでなんとでもなる。

- Bridge
- Strategy
- Factory Method

## Deno + Rust

- Wasm / WebAssembly
  - バイナリ形式のアセンブリ風の言語
  - 仮想マシン上で動くため OS や CPU に依存しない
  - C、Rust、Go など色々な言語からコンパイルできる
- Deno で Wasm を使う場合は、wasmbuild というツールを使う
  - Deno から Wasm の関数を簡単に扱うためのコードを自動生成してくれる
  - JS 側では単にインポートして関数を呼び出すだけで OK

## Go 言語らしい書き方

- if 文を以下と組み合わせて使う場合は else を省略できる
  - 早期リターン
  - continue
  - break
  - goto

```go
if ok := check(); ok {
  doSomeThingA()
  return
} else {
  doSomeThingB()
}

// ↓

if ok := check(); ok {
  doSomeThingA()
  return
}
doSomeThingB()
```

- 第 2 戻り値で条件分岐をする際は、else 句を使わずに変数を地べたに置いて、ネストをなくす方が良い

```go

if x, err := f(); err != nil {
  return err
} else {
  // use x
}

// ↓

x, err := f()
if err != nil {
  return err
}
// use x
```

- else if が多用されている場合は switch 文に書き換える
- defer 文を活用する
  - 関数が return されるまで処理を後回しにする
  - 用途
    - DB やファイルのクローズ
    - ロックの解放
    - 送信チャネルのクローズ
  - メリット
    - 確保と解放が近い場所に書けるので美しいし漏れが出にくい
- iota を活用する
  - Go には Enum がないので代わりに使う
  - 数値が割り振られる
  - 数値自体は代入できない
    - キャストすれば代入できるが、そもそもキャストしなくていいコードにしろ
    - Validation は自前で書く必要がある
- プリント出力時に数値ではなく意味のある文字列にしたい場合
  - 対象となる型に String メソッドを自前で実装する
  - 準標準パッケージである stringer を使う
    - `golang.org/x/tools/cmd/stringer`
    - `// go:generate stringer -type=Animal`のようなコメントを入れておくと自動で String メソッドが実装される

## Plurality

- オードリー・タンが提唱する、多様性を表す言葉
- クアドラティックボーティング
  - 参加者は一定量のクレジットをもち、それを投票に使う
  - ただし、同一選択肢への投票は二次関数的にコストがかかる
  - より多様な候補が選ばれやすくなる
- 分散型テクノロジー
  - 分散型 ID / Decentralized IDentifiers / DID
    - 人の証明
  - 検証可能な資格証明 / Verifiable Credentials / VC
    - 資格の証明
  - Non-Fungible Token / NFT
    - 交換できない価値を持つデータ
    - e.g. 絵画など
  - Soulbound Tokens / SBT
    - 購入では取得できないデータを表すための仕組み
    - 個人に紐付き、他人に売却や譲渡はできない
    - e.g. 能力証明書、評判、医療記録などに最適

## Terraform + Github Actions

- IaC / Infrasturcture as Code
  - インフラをコードで管理すること
  - アプリケーションコードと同じように、インフラに関しても PR、Lint、Test、Merge、Deploy の流れを作ることができる
- 認証方法
  - 🚨 サービスアカウントキーを使う方法
    - Github Actions のシークレットにサービスアカウントキーを登録する
    - Github Actions においてクレデンシャルとしてそれを読み込む
    - これはセキュリティ的によろしくない
  - ✅ Workload Identity を使う方法
    - Workload Identity とは、外部プロバイダ / IdP の認証情報をもとに、Google Cloud リソースへのアクセス制御を行う仕組み
    - 外部 IdP で発行されたトークンを検証し、そのトークンに事前に紐づけておいた Google Cloud のサービスアカウントを使ってリソースにアクセスする
    - Github Actions は OIDC に対応しているので、ID 連携に利用できる
- 自前で CI を構築する方法もあるが、Terraform なら Terraform Cloud を素直に使った方が予後がよさそう

## Figma + Storybook

- デザイントークン
  - 一定の定数から選べるように型化された値のこと
  - json ファイルで出力し、コードから参照して使う
  - デザインに統一性を持たせるために使う
- Storybook Connect
  - Figma の画面上から、リモートにホストされている Storybook URL を確認できるようにするプラグイン
  - デザインと実装がかけ離れていないか素早く確認するためのもの
  - UI コンポーネント単位でリンクする
- Chromatic
  - Storybook を含むリポジトリを一瞬でオンラインにサーブするための SaaS
- Figma は：
  - 「デザイン → 実装」工程に強い
  - 「実装 → デザイン確認」の工程に弱い
    - この弱みを補うのが Storybook Connect + Chromatic
