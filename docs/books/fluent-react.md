# Fluent React

この本は、エンドユーザー視点でReactの使い方を学ぶためのものではなく、
ライブラリ作者の視点でReactの仕組みを学ぶために書かれている。

## 1. 入口レベルの話

現代的なUXには、高度かつ頻繁な更新が必要である。
Reactがなぜ人気かというと、UIの**更新**をうまく扱えるからである。

従来の方法では、**更新にまつわるパフォーマンス、一貫性、セキュリティ**に限界があった。

- jQuery
  - Side effectful
  - いろいろ重い
  - 現代のブラウザにとっては冗長なAPIが多い
  - パフォーマンス悪い
- Backbone
  - MVCパターン
  - 状態管理が煩雑
  - MVCが密結合になりがち
  - ボイラープレートが多い
  - Composabilityの欠如
- KnockoutJS
  - ReactiveにUIを更新できる初めてのライブラリ
  - MVVM pattern / ViewModelが間に入る / ViewとVMは2way-binded / ViewはPassive
  - MとVの疎結合性や、テスト容易性を担保できる
  - ボイラープレートが多い
  - VMが肥大化して破綻しがち
- AngularJS
  - フレームワークそのものがやや複雑
  - パフォーマンスが悪化しがち
  - テンプレート構文の管理性が悪い
  - 型安全性の欠如
  - `$scope`の理解しにくさ
  - 開発ツールの少なさ

Reactは従前のライブラリと比べて以下の点で優れていた。

- 宣言的にUIが書ける
- vDOMによりパフォーマンスがよい
- コンポーネントにより管理性や構成性がよい
- Immutabilityによりパフォーマンスや安全性が高い
- プラットフォームを選ばない
- 豊富な開発支援ツール

## 2. JSX

### JSXとは

JSXはJavaScriptの拡張であり、JavaScript ファイル内に HTML のようなマークアップを書けるようにするもの。
JavaScript XMLとも呼ばれる。

AJAX = Asynchronous JavaScript and XML

昔はJSONよりもXMLがデータの形式として主流だった。
XMLHTTPRequestなんで名前にそれが入っちゃってるくらい。

JSXは最終的にプレーンなJSにトランスパイルされる。
JSのコードは`React.createElement()`や、React v17移行では`jsx,jsxs`を使って書かれる。

- JSXのメリット
  - 読み書きしやすい
  - サニタイズされるので安全
  - 型安全性がある
  - コンポーネントベース設計と相性がいい
- JSXのデメリット
  - 学習が必要
  - トランスパイルツールがなしでは動かない
  - プレゼンテーションとロジックが混ざる
  - JSの一部のみサポート（statementは書けない）

### 一般的にコードはどうやって実行されるか

まず、文字列(コード)が **Tokenizer** により意味のあるtokenに分解される。
なお、親や子の情報を持つStatefulなTokenを生成するTokenizerは、特に **Lexer** と呼ばれる。
次に、Tokenは **Parser** に渡され、ソースコードを木構造で表現したデータ構造に変換される。
このデータ構造のことを Abstract Syntax Tree (**AST**)と呼ぶ。
ASTは **Compiler** によりマシンコードに変換される。
マシンコードは **Runtime** により実行される。

Compiler には種類がある。

- Native Compiler
  - コンパイラが動作しているのと同じプラットフォーム用にコンパイルする
  - スタンドアロンアプリなど
- Cross Compiler
  - コンパイラが動作しているのとは別のプラットフォームに向けてコンパイルする
  - 組み込みやモバイル開発など
- Just-in-Time (JIT) Compiler
  - byte codeと呼ばれる中間コードの生成までを事前に済ませておく
  - byte codeから機械語への変換は実行時に行う
  - 仮想マシン内で動作する
  - Interpretersより速い
- Interpreters
  - コンパイルせずにコードそのものを実行する
  - 柔軟で使いやすいが遅い

JSは多くのブラウザではJITを使って実行される。
リアルタイムの情報に基づいた機動的な最適化により、パフォーマンスを引き出せるメリットがある。

**Runtime** はJavaScriptのエンジンにコンテキストを追加した、インターフェースのようなもの。
例えば、ブラウザなら`window`、Node.jsなら`fs`、Cloudflareなら`Workers`といったコンテキストがある。
BunやDenoにも独自のコンテキストがある。

### JSXはどうやって実行されるか

JSXを実行するには、独自のLexerとParserが必要となる。
エンジンに届く前に素のJSにトランスパイルしなければ、そもそも実行できないからだ。
この処理は **Build step** と呼ばれ、Babelなどにより行われる。

**トランスパイル** とは、同じ抽象度のレイヤーにおいて、ある言語を別の言語に変換すること。
なので、Source-to-Source compilation と呼ばれることもある。
TS->JSや、ES6->ES5など。

### Pragma

Pragmaは **Compilerに追加情報を提供するための指示** のこと。
言語自体で伝えられる範囲を超えた情報を伝えるときに使う。
`'use strict'`や`'use client`などもPragmaである。

JSXの`<`は JSX Pragma と呼ばれる。
これにより、コンパイラ(≒トランスパイラ)は`<`を`React.createElement()`や`_jsxs`などに置き換える。

## 3. Virtual DOM

### vDOMとは

Real DOMは`Node`オブジェクトからなる。一方、vDOMはプレーンなJSオブジェクトからなる。

vDOMはReactが持つ、UIの青写真である。
これを基にして、ブラウザ、iOS、Android、Shellといった、各環境に対応する成果物を生成する。
ブラウザ用の成果物は、DOMである。

Reactでは`setState`時などにまずvDOMが更新され、そのあとにDOMがvDOMに同期される。
この同期作業を **Reconciliation** と呼ぶ。
vDOMの更新はDOMの更新より軽量に行える。
また、必要最小限の差分だけをDOMに適用することで、パフォーマンスも向上する。

### Real DOMの落とし穴

Real DOMには多くの落とし穴がある。
パフォーマンス、クロスブラウザ互換性、セキュリティ脆弱性である。

まずは**パフォーマンス**だ。例えばDOM要素の`offsetWidth`を読むだけでも再計算が走る。
不要な再計算が連続することを **Layout Thrashing** という。
これを軽減する方法はいくつかある。
たとえば、CSSセレクタを工夫したり、プロパティの読み書きをバッチングしたり、CSSアニメーションを使ったり、などだ。
しかし、どれも複雑で大変だ。vDOMを使えばこれらの問題を解消できる。

次に**クロスブラウザ互換性**だ。
ブラウザによってDOMの仕様に微妙な差異がある。Reactはこの差異を埋めてくれる。
例えば、`SyntheticEvent`というネイティブイベントのラッパーを提供することで、
利用時のインターフェースを統一したり、イベントの起動条件を統一＆改善したりしている。
また、イベントリスナーは個々のDOMではなく、ルート要素にまとめてセットされたうえで管理される。
`e.nativeEvent`でネイティブイベントへのアクセス手段も残している。
これら一連の互換性担保のための仕組みも、vDOMの世界で実現されている。

最後に**セキュリティ脆弱性**だ。Real DOMを直接操作すると、XSSに弱くなりがちだ。
Reactでは明示的に危険なAPIを使わない限りは、デフォルトでXSS対策が適用される。

**Document Fragment**は、Real DOM Nodeの軽量なコンテナである。
`document.createDocumentFragment()`で作成する。
実際のDOMに適用する前段階で、ステージングエリアのように使うことが可能。
複数の変更を適用した後に、レンダリングは1回だけで済ませる事ができ、効率がよい。
Document Fragmentの持つ効率性を、
単一のNodeのみならずアプリケーション全体で使えるようにしたものがvDOMであると言える。

### vDOMはどう動くか

vDOMの構成要素は、**React Element**である。
これはHTML要素またはコンポーネントをvDOMで扱うための、軽量な代替表現である。
`React.createElement`や`_jsxs`で作成される。つまり`<`であり、JSXである。
JSXのアプリレベルでのツリー全体が、vDOMであるといえる。

React Elementは、以下のようなプロパティを持つ単純なJSオブジェクトである。

```js
{
  $$typeof: Symbol(react.element)
  type: "div",
  "props": {
    "className": "hogehoge",
    "children": { /* 別のReact Element群 */ }
  }
}
```

- `$$typeof` - React Elementの種類。element/fragment/portal/provider などの別
- `type` - HTMLタグ名またはコンポーネント関数。`"div"`(文字列)/`MyComponent`(関数)など
- `props` - propsのオブジェクト。`{children: "hello"}`など

メモリ上に保持される点では、実際のDOM Nodeを作る`document.createElement()`と似ているが、
React NodeはそのままDOMツリーに差し込まれることはなく、**永久に仮想である**点が異なる。
また、React Elementはインスタンス化するときに**propsやchildrenを受取って保持する**点も異なる。

画面の内容が更新されたときは、新旧のツリーを比較し、差分だけを効率的にReal DOMに反映する。
親から配下の全ての要素に対して再帰的に処理が行われるため、
**不必要な再描写が必然的に発生しうる**。
これを防ぐには、ルート付近にある値を広い範囲で使わないことや、
`memo`や`useMemo`による最適化が必要となる。

## 4. Reconciliation

### Batching

React v15 以前は**Stack Reconciler**が使われていた。
Stackの仕組みで動くため、更新の優先順位付けができず、常に決まった順番どおりに処理が行われる。
また、処理の中断やキャンセルもできない。
このため、本来は不要だったり優先度が低かったりする描写に時間がかかり、
パフォーマンスが悪化することがある。

これを改善するため、React v16 以降は**Fiber Reconciler**が使われている。
1つのvDOM要素(React Element)に対して1つのFiberが作成される(`createFiberFromTypeAndProps()`)。
Fiberは作業の単位を表す。
React ElementとFiberのデータ構造は似ているが、
前者がステートレス/短命/イミュータブルなのに対し、後者はステートフル/長寿命/ミュータブルである点が異なる。

Fiberはコンポーネントのあらゆる情報を持っている。
コンポーネントを定義している関数やクラスへの参照、コンポーネントインスタンスへの参照、
propsの状態、children、コンポーネントツリーでの位置、優先度を決めるためのメタデータなど。

**Double Buffering**という、チラツキや遅れを減らすための仕組みに基づいている。
もともとはゲームなどで使われるテクニックである。
画像やフレームを保持するバッファやメモリ空間(ここではFiber Tree)を2つ作り、
一定の頻度でそれらを切り替えながら画面を描写することで、画面の更新を効率化するもの。

裏で更新を準備できるため以下のメリットがある。

- ちらつきを防げる
- パフォーマンスが高い
- より優先度の高い更新が必要になったら（不要になったら）、いつでも処理を捨てられる
- 実際の画面を汚すことなく、いつでも処理を中断したり再開したりできる

コンポーネントのstateが更新されると、Current (Fiber) TreeをフォークしたWIP (Fiber) Treeが作成される。
このとき、両方のツリーの適切なFiberに、Laneという優先度を示すフラグがセットされる。
Fiber Reconciliation は、Current Tree と WIP Tree を比較しながら処理を行っていく。

- `workLoop`
- Render phase - このフェーズはいつでも中止と再開が可能
  - `beginWork`
    - WIP Treeのルートから末端に向けて、更新の要否を示すフラグを付けていく
    - FiberにセットされているLaneと、そのレンダリングサイクルでの処理対象Laneに基づいて、いま更新するか、後回しにするか判定を行う
  - `completeWork`- WIP Treeの末端からルートに向けて、実際のDOMをひとまずメモリ上に作りながら、戻っていく
- Commit phase / `commitRoot()` - Current TreeをWIP Treeと入れ替える
  - mutation phase / `commitMutationEffects()`
  - layout phase / `commitLayoutEffects()`
