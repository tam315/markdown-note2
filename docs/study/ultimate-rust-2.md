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

## Domumentation

`cargo doc --no-deps --open`を使うと良い。`--no-deps`をつけると依存関係のライブラリのドキュメントを生成しない。`--open`をつけるとブラウザで開く。

デフォルトでは`pub`になっているものがドキュメントに含まれる。`///`または`/** **/`でコメントを書くと、そのコメントがドキュメントに含まれる。

基本的な書き方はマークダウン記法だが、一点だけ違いがある。それは、`[]`の一発でリンクを貼ることができることだ。リンクはスコープ内のものであればなんでもよく、もしほしいものがスコープ内になければ、絶対パスを使えばよい。

```rust
/// link to the [`SOME_VALUE_IN_SCOPE`]
/// link to the [SOME_VALUE_IN_SCOPE]
/// [click here!](SOME_VALUE_IN_SCOPE)
```

ドキュメントには Outer Documentation`///`と Inner Documentation`//!`がある。Inner Documentation は、主にモジュール自体やクレートのルートファイルに対して使われる。

ドキュメントを書いておくと、[Crate.io](https://crates.io/) に自分のライブラリを公開したときに自動的に Web ページが生成される。

## Iterator

`IntoIterator`トレイトを実装していれば、`for`ループに与えたときに暗黙的に`.into_iter()`が呼ばれ、イテレータに変換される。

for ループはイテレータを使ったパターンに書き換えられる。

```rust
let v = vec![1, 2, 3];

for i in v {
    println!("{}", i);
}

// これは以下のようにも書ける
v.into_iter().for_each(|i| {
    println!("{}", i);
});
```

このようにするメリットは、速度が速いことと、Iterator Adaptor を使えること。

**Iterator Adaptor**は関数型プログラミングの道具の一つ。イテレータを受け取り別のイテレータを返す。その際、値に対して何らかのアクションを行う。例えば、`.map()`や`.filter()`などがある。

**Iterator Consumer**はイテレータを消費する。例えば、`.for_each()`、`.collect()`、`.sum()`、`.collect()`などがある。Iterator Adaptor は Lazy であり、Consumer に到達して初めて実行される。

Consumer ではジェネリック型が多用されており、明示的な型指定が必要となる場面が多い。ターボフィッシュ(`::<>`)を使って、`collect::<Vec<_>>()`のようにする。あるいは変数に代入する場合は、`let result: Vec<_> = hogehoge.collect()`のように変数に型注釈を行う。ちなみに`_`は型推論を行わせるためのもので、特に値が複雑な型の場合は超便利である。

[イテレータのドキュメント](https://doc.rust-lang.org/std/iter/trait.Iterator.html#provided-methods)を見ることで詳細を確認できる。

コレクションをイテレータに変換するメソッドは複数ある。

- `.into_iter()`
  - コレクションを消費して、もはや使えなくする
  - 所有権のある要素群を返す
  - `for _ in v`の糖衣構文
- `.iter()`
  - 参照群を返す
  - コレクションの値を見たいだけのときに使う
  - `for _ in &v`の糖衣構文
- `.iter_mut()`
  - 可変参照群を返す
  - コレクションの値を変更したいときに使う
  - `for _ in &mut v`の糖衣構文

最後にコーナーケースを紹介する。コレクションを消費することなくコレクションを空にしたり、一部を抜き出したい場合には、`.drain()`が便利。コレクション以外にもハッシュマップ等にも使える。

```rust
let mut v = vec![6, 7, 8, 9, 10];
let drained: Vec<_> = v.drain(1..4).collect();

assert_eq!(v, vec![6, 10]);
assert_eq!(drained, vec![7, 8, 9]);
```
