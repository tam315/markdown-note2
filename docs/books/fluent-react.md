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
  - 現代のブラウザには冗長な機能が多い
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
Tokenは **Parser** に渡され、Abstract Syntax Tree (**AST**)と呼ばれる、
ソースコードを木構造で表現したデータ構造に変換される。
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

**Runtime** はエンジンにコンテキストを追加したインターフェースのようなもの。
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
