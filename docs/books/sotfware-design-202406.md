# Software Design 202407

## Bun

Node.js は以下の問題を抱えていた。

- `package.json`や`node_modules`などによるパッケージ管理の複雑さ
- CJS/ESM の混在による複雑さ
- TypeScript の非サポート

これらを解消すべく Deno が生み出された。

- `package.json`や`node_modules`、CJS 廃止
- テストランナー・バンドラーの同梱
- TS の標準サポート

しかし、Deno は Node.js との互換性がなく、移行はあまり進んでいない。これを踏まえ、Bun は Node.js と Deno の中間的な特徴を持って誕生した。

- パッケージマネージャー、テストランナー、バンドラー、TS トランスパイラをすべて同梱しており追加作業が不要
  - npm/yarn/jest/webpack/esbuild/babel などがすべて不要
- とにかく速い
- Node.js/Jest と互換性を持つ
  - ドロップインリプレイスメントになることを目指している

Bun CLI というツールが含まれており、この CLI を使って様々な作業を行う。

- `bun run <file path>` ファイルを実行
- `bun run <script name>` package.json スクリプトを実行
- `bun x <package name` npx の代わり。`bunx`でもよい。
- `bun exec "echo hello"` シェルスクリプトを実行
- `bun install` パッケージのインストール
- `bun add <package name>` パッケージの追加
- `bun remove <package name>` パッケージの削除
- `bun update` semver に沿って最新化
- `bun link/unlink` 外部パッケージのリンク/アンリンク
  - yarn link と同じ
  - dependencies に`"pkg_a": "link:pkg_a"`のように書かれる
- `bun pm` パッケージマネージャーの使い方
- `bun pm bin (-g)` bin フォルダのパスを表示
- `bun pm ls` パッケージを一覧表示
- `bun pm cache (rm)` キャッシュフォルダを表示/削除
- `bun test` テストを実行する
- `bun test -t <filename>` 特定の名前を含むテストファイルを実行
- `bun test <filepath>` 特定のテストファイルを実行
- `bun build ./index.ts` バンドルして JS ファイルとして出力する（ベータ版）
- `bun compile ./index.ts` 実行可能バイナリとしてコンパイルする
