# Ultimate Rust 2

https://www.udemy.com/course/ultimate-rust-2/

## Ideomatic Code

ソフトウェア工学における「Ideomatic」とは、「与えられた文脈における自然な表現様式に従う」という意味。具体的には以下のようなことを指す。「要はバランス」案件なので、原理主義者にならないよう注意すること。

- 言語の機能を最大限に活用して、コードを簡潔で読みやすくする。ただし、書き方に関する議論に明け暮れてはダメ。
- コミュニティの標準的なコーディングスタイルに従う。ただし、流行に過度に影響されてはダメ。
- 公式ドキュメントやライブラリの使用方法に従う。ただし、それが実績あるエンジニアリングのやり方と反する場合には適切に破棄できる程度に尊重する。

### Rust の Ideomatic Code

`cargo fmt`でコードをフォーマットできる。IntelliJ の設定から`rustfmt`で検索し、`Use Rustfmt instead of the built-in formatter`にチェックを入れてたうえで、保存時にフォーマットがかかる設定にしておくと便利。

`cargo clippy`で様々な検査を行える。Style, Correctness(e.g. 消してもいいようなコード), Complexity(e.g. 無駄に複雑), Performance(e.g. 無駄に遠回り)に関する指摘をしてくれる。 警告を無視したい場合は`#[allow(clippy::xxx)]`のようにする。

### Domumentation

`cargo doc --no-deps --open`を使うと良い。`--no-deps`をつけると依存関係のライブラリのドキュメントを生成しない。`--open`をつけるとブラウザで開く。

`pub`になっているものはドキュメントに含まれる。`///`または`/** **/`でコメントを書くと、そのコメントがドキュメントに含まれる。

マークダウン記法に加えて、以下の方法で他項目にリンクを貼ることができる。リンクはスコープ内のものであればなんでもよく、もしほしいものがスコープ内になければ、絶対パスを使えばよい。

```rust
/// link to the [`SOME_VALUE_IN_SCOPE`]
/// link to the [SOME_VALUE_IN_SCOPE]
/// (click here!)[SOME_VALUE_IN_SCOPE]
```

ドキュメントには Outer Documentation`///`と Inner Documentation`//!`がある。Inner Documentation は、主にモジュール自体やクレートのルートファイルに対して使われる。
