# エンジニアのためのドキュメントライティング

## 🟢 Part1 ドキュメント作成の準備

## 読み手の理解

### 知識の呪い

- 知識の呪いとは、他人が自分と同じ知識を持っていると思い込むこと
- しかし、そんなことはまずない

### ユーザーを理解する

#### 準備

- まずは既にある情報を見直して頭に入れておく
  - e.g. 設計書、Slack の会話、コードのコメントほか

#### "ユーザが誰か"を定義する

- 読者として想定するユーザに共通する具体的な特徴を書き出してまとめる
- ユーザを定義する要素は色々ある
  - 役割（開発者、PD、シスアド、etc...）
  - 経験レベル
  - ドキュメントを読む状況 ... など
- なおユーザ全員のニーズは満たせないから初めから諦めろ

#### "ユーザのゴール"を定義する

- e.g. 犬の鳴き声を人の言葉に翻訳する
- プロダクトのゴールとは異なることに注意

#### "ユーザーのニーズ"を定義する

- ニーズ = ユーザがドキュメント求めるもの
  - Needs に焦点を当てること！Wants ではないよ。
    - 彼らは車を運転したいと言うが免許を持っていないかもしれない、ならタクシーチケットをやればいい
- ざっくりで OK。定義したユーザーが疑問に思いそうなことを書き出してみる
  - これは何？
  - これが解決する問題は？
  - どんな機能が？
  - 費用は？
  - どうやって始められる？

### ユーザーの理解が正しいか検証する

- ユーザが誰で、ユーザのニーズとゴールは何か、という仮設の検証を行うときに使えるツール
  - サポートチケット
  - インタビュー
  - アンケート

#### 既存の情報リソースを使う

- 例えばサポートチケットは宝の山
  - 書こうとしているドキュメントに関する最近のチケットを分類してパターンを見つけよう
- 他にも UX チーム、営業、マーケティング、etc... から情報を集めることができる

#### 新しいデータを集める

- 既存の情報リソースだけでは不十分な場合は、新しいデータを集める
- インタビュー
  - 重要なトピックについて深く掘り下げるために使う
  - 量より質が大事。たくさんの人に聞くより、質の高い少数の人に深く聞く。
  - オープンな質問で聞け（ストーリーや長い説明による回答をしてもらう）
  - クローズな質問（はい or いいえなど）は避ける、もしくは言い換えてオープンな質問にする
- アンケート
  - 多くの人に答えてもらう、また偏りなくデータを集めるために：
    - 短時間で簡単に答えられるものにする
    - 全てを網羅するよりも少数の質問に絞り込む
    - クローズな質問で訊く
    - 調査の理由を明記しておく
    - インセンティブや報酬を与えるのもアリ

### ユーザ調査から得られた知見をまとめる

まとめるための 3 つの方法

- ユーザーペルソナ
- ユーザーストーリー
- ユーザージャーニーマップ

#### ユーザーペルソナ

- 理想の、または現実の読み手を表現するために作られる半分架空のキャラクターで、以下から構成される
  - 個人に対する短い説明文
  - 個人のゴール、スキル、知識、状況などのリスト
- 調査で理解したユーザーに関する特徴をまとめたもの
- 複数人いても OK
- 以下を鑑みながら対象とするペルソナを決める
  - 最も支援が必要なのは誰？
  - 最も急な学習曲線を描くのは誰？
  - プロダクトの採用に影響を及ぼすのは誰？

#### ユーザーストーリー

- ユーザーが達成したい大まかなタスクやモチベーションを短くまとめたもの
- `「あるユーザー」として「あるゴール」を達成するために「ある活動」をしたい` の形式でまとめる
- 「API の使い方を知りたい」というような具体的な内容**ではなく**、より抽象度の高いレベルで捉える

#### ユーザージャーニーマップ

- プロダクトでユーザがたどった経路を図解したもの
- 以下から構成される
  - ユーザーの概要
  - シナリオ
  - ユーザーが実施する手順をまとめる
  - 手順ごとに以下を書いていく
    - ユーザー体験（何をしているか、気持ち、疑問、考え）
    - 改善機会

### フリクションログを作る

- フリクション = 期待と実際の差異
- フリクションログ = ユーザーがプロダクトを使う際に経験するフリクションを記録したもの
- 1 つのタスク（e.g. 「アカウントに登録する」や「API キーを作成する」など）ごとに、以下のログを書いていく
  - やったこと
  - 期待と実際に差異があった（不満があった）こと
- 何がいいか
  - 新しい改善点を見つけられる
  - プロダクトを初めて体験する感覚を思い出せる
  - ドキュメントの使いやすさをテストできる

## ドキュメントの計画

### コンテンツのタイプ

#### コードコメント

- 簡潔なコメントによって過去の意思決定の背景を保存しておくことは、将来の開発者にとって非常に有用
- 「自己文書化」という言葉に捕らわれすぎるな。現実世界は複雑だ。

#### README

- 簡潔・有益・正確・最新であること
- チートシートとして機能する
- ドキュメントの基礎である
- 追加情報は付録として羅列しておく
- 以下のような内容を書いておく
  - 概要
  - インストール方法
  - トラブルシューティング
  - メンテナ・ライセンス・更新履歴
  - 基本例
  - 詳細情報へのリンク

#### スタートガイド

- よくある`Get Started`の類
- 素早く簡単に始めるための短いドキュメント
- よくあるトピック
  - サービスの核を最も短く説明する
  - 使い始めるための最も簡単な手順を教える
  - 新規ユーザの感じる最も重要な疑問に答える
  - サービスを使ってできるすごいことを知らせる
- 詳細なドキュメント**のみ**を作るのは、やりがちな間違い

#### コンセプトドキュメント

- コンセプト = 具体的な形になる前の抽象的な、アイデアや概念、考え方
- コンセプトドキュメント = サービスがどのようにユーザのために機能するのかを説明するドキュメント
- サービスの裏側にある考え方とアイデアの理解に役立つ
- 短く簡潔に保つこと。一度に一つまたは少数のコンセプトを説明すること。
- 議事録、設計文書、ホワイトボードに書いた図、内部向け文書にリンクしながら説明していく

#### 手順書

- ユーザーが抱える課題を解決するために必要となる手順を、1 ステップごとに、全てまとめたもの
- 長いと、ユーザがビビる＆ミスる＆保守が大変なので、短く保つこと
- チュートリアル
  - 自分に役立つかどうかユーザが手早く判断するためのもの
  - 10 以下のステップで構成しないと読んでもらえない
- ハウツーガイド
  - 手順書の本丸
  - 1 つの課題ごとに 1 つのドキュメントを作る
  - 言葉をシンプルにすること
  - 行動を明確に書くこと
  - 前提条件を伝えること
  - リンクは少なく

#### リファレンスドキュメント

- API リファレンス
- 用語集
- トラブルシューティングドキュメント
- 変更履歴に関するドキュメント

### ドキュメントを計画する

- まずはアウトラインを作ることで迷子になるのを防ぐ
  - タイトル
  - コンテンツのタイプ
  - 簡単な説明

## ドキュメントの作成

- まずは以下を決める
  - 読み手
    - e.g. 〇〇というサービスのユーザ
  - 目的
    - e.g. アカウント登録の方法
  - コンテンツパターン
    - e.g. 手順書
- 上記を元にタイトルを決める。
  - e.g. 「〇〇サービスでアカウントを登録する」
- アウトラインを作る
  - すべてのサブタスクを書き出す
  - 並べ替えたり階層化したりしてヌケモレやイマイチなところがないか確認する
- ドラフトを書く
  - 見出し
    - 簡潔・明快・具体的
    - 一貫性を保つ
  - 段落
    - 文は 5 個以下にする
  - 手順
  - リスト
  - コールアウト
    - 流れから少し外れるものの大切なヒントや警告につかう
    - 使いすぎるな
- 流し読みに最適化する（ユーザはほとんど読まない）
  - 重要な情報を冒頭付近に書く
  - 大きな段落は分割する
  - 長文ドキュメントは複数のドキュメントに分割する
- Tips
  - 完璧主義はやめる
  - 助けを求めるのも大事
  - 足りないコンテンツは TODO などに書いておく
  - 順不同で書いて OK

以下略