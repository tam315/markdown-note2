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

### Fiber Reconcilerとは

React v15 以前は**Stack Reconciler**が使われていた。
ルート要素から末端方向にスタックにタスクを積みながら走査していくため、
優先順位付けができないうえ、処理の中断やキャンセルもできない。
Batchingも行われないためパフォーマンスも悪い。

これを改善するため、React v16 以降は**Fiber Reconciler**が使われている。
Fiberとは、画面更新時の作業単位を表したJavaScriptオブジェクトである。
1つのvReact Elementに対して、1つのFiberが作成される。

両者のデータ構造は似ているが、前者がステートレス/短命/イミュータブルなのに対し、
後者はステートフル/長寿命/ミュータブルである点が異なる。

Fiberはコンポーネントのあらゆる情報を持っている。
コンポーネントの定義関数またはクラスへの参照、コンポーネントインスタンスへの参照、
propsの状態、children、コンポーネントツリーでの位置、優先度を決めるためのメタデータなど。

```ts
// Fiberオブジェクトの一例
{
  tag: 3, // 3 is Class Component
  type: MyComponentClass,
  key: null,
  ref: null,
  props: {/* */},
  stateNode: InstanceOfMyComponentClass,
  // ...親・子・兄弟Fiberへの参照や、indexなど
}
```

Fiber Reconcilerは、**Double Buffering**という仕組みで動作する。
これは、もともとはゲーム画面などで使われるテクニックである。
画像やフレームを保持するバッファやメモリ空間(ここではFiber Tree)を2つ作り、
一定の頻度でそれらを切り替えながら画面を描写する。
これにより、高パフォーマンスで、中止(スケジューリング)可能で、ちらつきのない更新を実現できる。

### Fiber Reconcilerの動作

コンポーネントのstateが更新されると、Current Fiber TreeをフォークしたWIP Fiber Tree が作成される。
なお、ソース上ではWIPの代わりにAlternateという言葉が使われている場所もある。

このとき、更新対象となるFiberやその祖先となるFiberに、Laneという優先度を示すフラグが適宜セットされる。
処理が中断されても優先度が消失しないようにするため、この記録はCurrentとWIPの両方に対して書き込まれる？
ソースは[このあたり](https://github.com/facebook/react/blob/6eda534718d09a26d58d65c0a376e05d7e2a3358/packages/react-reconciler/src/ReactFiberConcurrentUpdates.js#L194-L208)。

- ワークループ / `workLoop()`
  - Render phase
    - このフェーズはいつでも中止と再開が可能
    - `beginWork()`
      - WIP Treeのルートから末端に向けて走査する
      - Current Treeと見比べながら、更新の要否を示すフラグを付けていく
      - 対象のFiberが所属しているLaneと、いまのレンダリングサイクルがどのレーンを処理しているかに基づいて、いまのサイクルで更新するか後回しにするか判定する
    - `completeWork()`
      - WIP Treeの末端からルートに向けて、実際のDOMをひとまずメモリ上に作りながら、遡上していく
      - 作ったDOMはWIP Treeの対象Fiberの`stateNode`にくっつけておく
  - Commit phase
    - `commitRoot()`
      - `FiberRootNode`の向き先をCurrent TreeからWIP Treeに切り替え、実際の画面への適用を開始する
    - mutation phase / `commitMutationEffects()`
      - 出来上がったWIP Treeを走査しながら、実際のDOMに変更を適用していく(追加・更新・削除)
    - layout phase / `commitLayoutEffects()`
      - 更新されたDOMの新しいレイアウトを計算する
    - Effect
      - Commit Phaseでは副作用も実行される
        - Placement Effect - コンポーネントが新規に追加されたとき
        - Update Effect - コンポーネントのpropsやstateが変更されたとき
        - Deletion Effect - コンポーネントが削除されたとき
        - Layout Effect - `useLayoutEffect`がセットされているとき(画面描写の前に実行される)

以上の仕組みにより以下が実現された。

- Batchingによる高パフォーマンス性
  - ただし非同期処理後など、レンダリングサイクル外でのBatchingはReact v16ではなくv18以降で可能になった
- Time Slicingによる優先順位を考慮した効率的な描写
- 描写途中での柔軟なスケジュールの変更(処理が中断可能になったので)

## 5. よくある疑問、強力なパターン

### `React.memo`

Memoization(メモ化、not memo_r_ization)は関数のパフォーマンスを改善するための、コンピューターサイエンスにおけるテクニック。
純粋関数(副作用がない＋参照透過である)においては、入力が同じならキャッシュした出力を返しても構わない、ということ。

Reactでは、画面に再描写がかかると、前回に描写したときのvDOMと最新のvDOMを比較し、
差分に応じてReconcilerがUpdate effectやPlacement effectを実行する。
Update effectはpropsの値に変更がなくても実行される。

React.memoは**コンポーネントをメモ化し、不要なレンダリングを防ぐ**ための関数である。
React.memoにコンポーネントを渡すと、propsに変更がない限り再描写しないように調整された、新しいコンポーネントを返す。

React.memoは、propsの第一階層だけを`===`で順に比較するので、
propsにnon-primitiveな値(配列やオブジェクト）を与えるときは、
useMemoでラップしてやらないと、結局再レンダリングされてしまうので注意。

### `React.useMemo` & `React.useCallback`

**useMemoは、コンポーネント内において、高価な計算を避けたり、オブジェクトへの安定した参照を得る**ためのもの。
代表的な使用例としては、親から与えられた配列をコンポーネント内でソートする場合など、non-primitiveな値に対する計算処理に使う。
なお、プリミティブな値は参照ではなく直接比較されるため、参照の安定性を考慮する必要はない。

**useCallbackはuseMemoの関数版**。
キーストロークのたびに再描写されるような、頻繁に更新されるコンポーネントや、
React.memoされているコンポーネントに関数を渡す場合に、最小限に使うとよい。

`div`や`button`といったカスタムコンポーネントではないものを、built-in component や host componentという。
前者では描写時の扱いが微妙に異なる。概して効率的に処理されるので、与える関数をメモ化することは考えなくていい。

- propsで与えた関数はそのまま無改変でアタッチされる
- ただし`onClick`のようなイベントコールバックは、その要素自体ではなくルート要素にまとめてアタッチされ、イベントプーリングという仕組みとともに、効率よく管理される

### React Compiler

React Compiler (社内コードネーム: React Forget)のリリースにより、
前述のメモ化は自動で行われるようになったため、開発者が手動で対処する必要がなくなった。

### `React.lazy` & `Suspense`

大きなプロダクトで愚直にJSを同期的に読み込むと、初期ロードが遅くなりがち。
そのため、JSのプロジェクトでは、scriptタグの`async`属性や、
`import()`関数を用いて遅延読み込みを行うことがある。

さらに、lazy + suspense + importを組み合わせることで、
必要になるタイミングまでコンポーネントの取得を遅延させることができる。

```ts
import React, { lazy, Suspense } from 'react';
import FakeSidebar from './FakeSidebar'; // 取得が完了するまではダミーを表示

const Sidebar = lazy(() => import('./Sidebar'));

function App() {
  const showSidebar = true; // ホントはuseStateなどで管理
  return (
    <Suspense fallback={<FakeSidebar />}>
      {showSidebar  && <Sidebar />}
    </Suspense>
  );
}
```

### `React.useState` & `React.useReducer`

一般論として、useStateは高レベルなので簡素なコードになる。useReducerは低レベルなので複雑なコードになる。
useStateはuseReducerを抽象化したものにすぎない。実際に内部ではuseReducerを用いている。

useReducerには以下のメリットがあるので、状態管理が複雑なケースで有効だが、多くの場合ではオーバーキルである。

- テストが書きやすい
- 状態とその変更方法を一箇所にまとめられる
- event-sourcedモデルなのでタイムトラベルデバッグや楽天更新がやりやすい

Reducerは純粋関数である必要があり、常に新しいオブジェクトを返さねばならない。
しかし、ネストしたプロパティを書き換えようとすると冗長になりがち。
`immer`や`use-immer`などのライブラリを使うと、ネストしたプロパティの更新が楽になる。

### 強力なパターン

**Presentation/Container**パターンはロジックと描写の関心を分けられるという点で強力だが、
いまではその多くがhooksで代用可能。

**Higher-order component**は、コンポーネントを受け取って別のコンポーネントを返すコンポーネント。
重複を避けながら振る舞いを共有するために使う。慣例として`with***`という名前の関数として実装される。
型安全性、レンダリングの効率性、Wrapper-hellなど色々問題があり、いまではhooksに代用された。

**Render propsやchildren as a function**もロジックを共有するためのパターンだが、
こちらもhooksに代用された。

**Controll props**は親から制御用の値をpropsとして差し込む手法。
宣言的なUIを作るのに役立つ。
Controlled & Uncontrolled のどちらでも使えるようにコンポーネントを実装すると、
使う側は便利だったりする。

**Prop collections**は、よく使うまとまりのpropsを一箇所で定義して利便性を高める手法。
特に関数群に対して使うと有効。
デフォルトの関数の挙動に加え、使用時に任意で処理を付け加えられるように、
Prop getterが関数群をcomposeする構成にすると、使いやすい。

**Compound components**は、描写の責務だけを親に委譲して依存を逆転させることで柔軟性を高めつつ、
stateに対するロジックは子に書けるようにする方法。
タブやアコーディオンの実装でよく使う。
たとえば5項目ごとに間に線を入れたい、みたいなユースケースで便利。
Contextを使った親コンポーネントと、その利用者である子コンポーネント群の組み合わせとして実装する。

**State Reducer**パターンは、コンポーネントの状態管理の制御を外部に委譲するパターン。
カスタムなreducerをpropsとしてコンポーネントに渡すことで依存を逆転させる。
デフォルトの振る舞いは提供しつつ、特殊なケースでは処理を変更したい場合などに使われる。

## 6. Server-side React

Server-side renderingは以下の問題に対処するために生まれた。

- SEO - 全てのクローラーがJSを動かせるわけではない
- パフォーマンス - ウォーターフォールリクエスト、Time-to-interactiveの長さ、非力なデバイスへの対応
- セキュリティ - CSRF対策がやりにくい

Hydrationとは、サーバー側で生成してクライアントに送られた静的なHTMLに対し、
JSの機能やイベントリスナーをあとから添付するプロセスのこと。
素朴な実装だと、以下のような流れで実現される。

- サーバー側
  - `react-dom/server` -> `renderToString(<App />)`という感じでhtmlとして描写する
  - HTMLのテンプレートに、前述の結果と、ビルドしたJS(Client bundle)を埋め込んでクライアントに送る
- クライアント側
  - HTMLを読み込んで描写する
  - Client bundleのダウンロードして読み込む
  - DOMに対してイベントリスナの添付と、動的な機能の添付を行う
    - `react-dom` -> `hydrateRoot(document, <App />)`という感じで行う
    - このとき、サーバーから受け取った静的HTMLと、クライアントで生成したJSXに不一致があればエラーを吐く

Hydrationには、画面が描写されてからインタラクションが可能になるまでわずかに時間がかかるという欠点がある。
Hydration の代わりに **Resumability** という仕組みを使うことで、
静的HTMLだけでなくインタラクションも含めて同時にストリーミングし、
描写後すぐにインタラクション可能にする手法も検討されているが、まだ議論の段階。

Reactをプリレンダリングするためのメソッドは3種類ある。

- `renderToString`
  - JSXを受け取り、HTML stringを返す
  - 同期
  - すぐにイベントループを選挙してパフォーマンス問題が起こる
  - シンプルかつ限られたユースケースでのみ使える
- `renderToPipableStream`
  - JSXを受け取り、Node.jsのReadableStreamを返す
  - Node.js環境専用のAPI
  - 非同期
  - ネットワークを超えてストリームが可能(Suspense対応)
  - 全ページのレンダリングを待たずに、できた部分から逐次送信するので、TTFBがはやい
- `renderToReadableStream`
  - Web標準のReadableStreamを返す
  - ブラウザAPI互換のランタイム(Deno, Bun, Cloudflare workers)でも動作可能
  - 一部のサードパーティー製ライブラリが動作しない場合がある
  - その他は前項の関数と同じ

**Node.jsのストリーム**には4種類ある。
大きなデータの取扱い、ファイルのIO操作、ネットワーク通信などで活躍する。

- Readable stream
  - データの源
  - `data`(「データを送ったよ」), `end`, `error`イベントを発火する
- Writable stream
  - データの行き先
  - `write()`,`end()`といったメソッドを提供する
  - `drain`(「次のデータ受け入れが可能になったよ」)や`error`イベントを発火する
- Duplex stream
  - Readable streamとWritable streamを同時に実装したストリーム
  - ネットワークソケットなどで使われる
- Transform stream
  - 特殊なDuplex streamで、入力データを変換するストリーム
  - 圧縮、暗号化、データのパースなどに使う

**ブラウザのストリーム**は、イベントベースのNode.jsのそれと異なり、
`read()`,`write()`,`pipeThrough()`といった promise-based な API を提供する。
WHATWGが策定する標準仕様に沿っている。

以下のメリットがあるので、SSRを自前で実装するのはやめておいて、フレームワークを使え。

- セキュリティリスクがあらかじめ潰されている (e.g. キャッシュのコンタミネーション)
- パフォーマンスがよい (e.g. Automatic Code Splitting)
- なにもせずとも簡単に使えて、ビジネスの本質に集中できる
- 自然とベストプラクティスに沿うことができる

## 7. Concurrent React

従来の同期的なレンダリングは、パフォーマンスに問題が起きがちだった。
Concurrent renderingは、重い計算処理中でもUIが応答性を保てるようにするための仕組み。
Fiber Reconciler がそれを実現している。

- 優先度の概念がある
  - 重要な更新が、そうでない更新にブロックされないようにする
  - e.g. ボタンを押したときのフィードバックは優先、表の描写は非優先、など
- タイムスライスができる
  - レンダリング作業を小さな単位に分割することで、一時停止、再開、順序の入れ替えを可能にした
  - これによりメインスレッドを長時間ブロックしないようにする

### マイクロタスクとは

JSでは非同期処理を実現するためにEvent Loopが使われる。
この人はタスクがある限り永遠にそれを処理し続ける。

タスクには(Macro) Taskと**Microtask**の2種類がある。

Taskは、クリックなどの入力UIイベント、`setTimeout`、I/O操作などで発生する。
(Macro) Task Queueに入る。順次1つずつ処理される。

MicrotaskはPromiseなどで発生し、Microtask Queueに追加される。
Taskの処理が終わったら、溜まっているMicrotaskを全て処理してから、次のTaskに移る。

Microtaskが多すぎてTaskが処理されない状況を**Starvation**という。

### Render Lanes

レーンには多くの種類がある。`SyncLane`、`DefaultLane`、`TransitionLane`、`InputContinuousLane`など。

Reactは、優先レーンの更新はMicrotask Queueに入れて即時に処理し、
そうでないレーンの更新はスケジューラーにタイミングの決定を委譲する。

コンポーネントが追加または更新されると、以下に基づいて適切なレーンが選択される。

- 更新のコンテキスト（by ユーザー操作、by データ取得、by バックグラウンド処理）
- コンポーネントの可視性
- `useTransition`で呼ばれたか

Fiber Concilerは、優先度の高いレーンから処理していく。
同じレーンの処理はBatchingされる。
1つのレーンを処理するごとにCommit Phaseを経る(DOMの更新とEffectsの実行)。
全てのレーンが処理されるまで、処理が続く。

### `useTransition` & `useDeferredValue`

Reactのレーン選択は賢いが、ものによっては開発者が明示的に選択する必要がある。

その時に使うのが`useTransition`(コンポーネント内用)や`startTransision`(コンポーネント外用)だ。
主にユーザーインタラクション時における画面のチカチカを防ぎたいときに使うとよい。

特に、Suspenseと組み合わせて使うと便利で、
画面遷移やタブ切り替えの際に以下のようなことができるようになる。

- バックグラウンド(=低優先)でデータ読み込み、描写も準備する
- 準備中は現在の画面を表示したままにしてUXを高く保つ。必要に応じてローダーなども出す。
- 準備ができた段階で画面を一発で切り替える
- なお、初期のフルロードではSuspenseのFallbackが表示される。

`useDefferedValue`は`startTransition`の薄いラッパーだ。
値をセットしたときに、自動的に`startTransition`の中で値を更新することで、
他の優先度の高い処理をブロックすることなく処理を行う。
Stateの更新が、あまり重要ではないヘビーな描写を引き起こす場合に使う。
stale-while-revalidateの考えに基づいている。

主なユースケースは以下である。
ただし、ユーザー入力に起因するものにだけ使うのがポイント。

- 大量データに対するフィルタや検索をしたいとき
- 複雑なビジュアライゼーションやアニメーションをしたいとき
- サーバーからのデータをバックグランドで更新したいとき
- ユーザーインタラクションに影響を及ぼすくらいの重たい処理があるとき

### Tearing

画面上で同じデータソースを参照しているはずの複数のコンポーネントが、異なる値を表示してしまう現象。
Concurrent Renderingによるコンポーネント群の描写の時差に起因して発生する。
データソースがグローバルだったり外部にあったりする場合に起きる。
`useSyncExternalStore`を使うことで解消できる。これは以下の2つを行う。

- Concurrent Render全体において、一貫した値を提供する (優先レーンで同期的に描写する)
- 値が変わったときに必ず同期的な描写を実行する

## 8. Frameworks

ReactはUnopnionatedなので、開発者が選択できる余地が広い。
これは自由さでもあるが、制約にもなりうる。
その**余地をあらかじめ埋めてくれるのがFramework**である。
余地には以下のようなものがある。

- Data fetching
  - State management, Caching, Error handling が必要である
- Routing
  - Isomorphic、つまりサーバでもクライアントでも動く必要がある
  - File-based or Code-based などの選択肢がある
- Server rendering
  - なるべく早期、つまりページ読み込み時にデータフェッチして、SSR時にそれをInjectする必要がある

メリット

- 構造とパターンに一貫性が強制されるので、新人の適応が早かったり、本質的な機能開発だけに集中できたりする
- ベストプラクティスに沿えるので、品質が上がってバグも減る
- よく抽象化されているので、コードが簡素で読みやすく保守性が高いものになる
- Code-splittingやPreloadなど、パフォーマンスがあらかじめ最適化されている
- 大きなコミュニティとエコシステムによる恩恵を受けられる

デメリット

- 学習コストがかかる
- 要件によっては、規約により得られるメリットよりも、それにより失われる柔軟性の影響の方が大きい場合もある
- Frameworkと一蓮托生になるリスク
  - メンテされなくなったり、対応不可能な破壊的変更が入ったり、方向性が明後日の方角に進み出したらどうする？
- 抽象化による魔法が増えると、逆に理解やデバッグやパフォーマンス最適化が難しくなる

### Remix

`entry.server.tsx`にSSRのロジックが描かれており、カスタマイズが可能。
このファイルを消せばデフォルト挙動にフォールバックする。
FrameworksによるMagicによるロックインを避ける作りになっている。
ボットリクエスト時にはSEO効果が高くなるよう、なるべく全部を描写して返すような工夫がされている。

データの更新時には、フォームのstateや振る舞いの管理はブラウザに任せることで、web標準に回帰している。
これにより、Hydrationが完了する前であってもフォームが動作する。
Reactで全てを管理することで生まれる学習コスト・複雑さ・オレオレ仕様に対して、あざやかにNoをつきつける。

### Next.js

多くの複雑さは隠蔽されており、開発者は大事なことに集中できる一方、魔法が多いとも言える。

server-firstであり、`use client`を明示的に書かない限りは、
サーバーでのみレンダリングされる「サーバーコンポーネント」になる。
また、static-firstであり、可能な限り静的HTMLとして描写される。
これらにより、キャッシュを効かせ、JSサイズを小さくし、高いパフォーマンスを実現する。

データ取得は、サーバーコンポーネントの中で単に`await`するだけで行える。

データミューテーションはServer Actionsで行う。
これはサーバーサイドで実行される関数で、`use server`で表現する。
このコードはJSバンドルに含まれず、必ずサーバサイドで実行される。
クライアントコンポーネントから呼び出して使うことも可能。

### フレームワークの選択

まずは要件を洗い出せ

- プロダクトのサイズと複雑さは？
- プロダクトの主な機能は？
- SSR or SSG or どっちもいる？
- SEOが生命線のコンテンツヘビーなサイト？
- リアルタイムまたは動的なコンテンツが生命線のサイト？
- ビルドプロセスにおけるカスタマイズ性はどれくらい必要？
- パフォーマンスとスピードはどれくらい必要？
- 開発者の熟練度は？
- ユーザーはネットワーク環境等の良いエンプラか or 悪い一般消費者か？
