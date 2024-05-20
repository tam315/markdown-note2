# Rust

## コメント

- `//`と`/* */`が使える。
- `///`を使うと[ドキュメンテーションコメント](https://doc.rust-lang.org/rust-by-example/meta/doc.html)になる
  - マークダウンで書いたコメントが HTML ドキュメントになる

## Cargo

cargo は以下の全てをこなす、何でもできるひと。

- Package manager (like npm)
- Build system (like `make`)
- Test runner
- Docs generator

## 変数と可変性

Rust では変数はデフォルトで不変である。これは、安全、並列性、スピードのためである。

- 変数
  - 不変 `let x=5`
  - 可変 `let mut x=5`
  - 命名規則は小文字のスネークケース
  - rust では「値 5 を x に拘束する」という表現をする
- 定数
  - `const MAX_POINTS: u32 = 100_000`
  - 命名規則は大文字のスネークケース
  - 型注釈は必須
  - コンパイル時に値が定まる式（定数式）のみをセットできる
    - 一方で immutable な**変数**はあらゆる式(e.g. 関数の戻り値など)をセットできる

### シャドーイング

- 前に定義した変数と同じ名前の変数を新しく宣言して上書きすること
- ブロック内で使用した場合はブロック内でのみ有効
- シャドーイングは型を変更できるという点で、`mut`とは異なる。
- うまく使うとコードを可読性を向上させたり、凡ミスの可能性を減らしたりできる

```rust
let v = 1;
{
    let v = 2;
    // v === 2
}
// v === 1
let v = 3;
// v === 3
```

## データ型

大きくわけてスカラー型と複合型(Tuple, Array)がある。

### スカラー型

スカラー型には基準型がある。基準型というのは、型注釈のない変数宣言などで、優先して選択されるデータ型のこと。

- 整数
  - `i8`, `u8`, `i16`, `u16`, `i32`, `u32`, `i64`, `u64`, `isize`, `usize`
  - 基準型は`i32`
  - `usize`はプラットフォームに依存する。プロセスで使用するメモリアドレスをどこでも表せる。
  - `isize`もプラットフォームに依存する。Array の上限数と等しい。メモリアドレス間の差分を表すのに使ったりする。
  - 一部しかサポートしないプラットフォームもあるので注意
- 浮動小数点数
  - `f32`(単精度浮動小数点数), `f64`(倍精度浮動小数点数)
  - 基準型は`f64`
  - 一部のプラットフォームでは f64 はマジで遅くなるので注意
- 論理値型
- 文字型
  - `char` 型
  - シングルクオートで表す
  - Unicode Scalar Value である
    - `U+****`の`****`の部分
    - 最大 21-bit なので、キャストするときはそれ以上の型でないと表現しきれない点に注意
    - https://lets-emoji.com/emojilist/emojilist-1/
  - よって世間一般的な「文字」とは離れた性質のものも含まれる(e.g. ゼロ幅スペース)
  - ほとんどの場所では UTF-8(≒ 文字列)を使うので、あまり使うことはない

### Tuple

アリティ（Tuple の要素数）は最大で 12 までで、それを超えると機能が制限される。

```rust
let tup: (i32, f64, u8) = (500, 6.4, 1);
// or
let tup = (500, 6.4, 1);

// 分配と呼ばれる代入方法
let (x, y, z) = tup;

// 0番目の要素にアクセス
let five_hundred = x.0;
```

### Array

要素数は最大で 32 までで、それを超えると機能が制限される。

```rust
let a = [1, 2, 3, 4, 5];
let a = [123, 3]; // 123を3つ

// 添字を使ったアクセス
let first = a[0];
let second = a[1];

// 型を指定する方法
let a: [i32; 5] = [1, 2, 3, 4, 5];
let b: &[i32] = &a;
```

- 一度宣言した Array の要素数を変更することはできない
- 可変長が必要な場合はコレクションライブラリ（e.g. Vector 型）を使う必要がある
- Array の終端を超えたアクセスはパニックになる

## 型推論

複数の型が推論される可能性がある場合、型注釈が必須。

```rust
let guess: u32 = "42".parse().expect("Not a number!");
```

## リテラル

リテラルとは「見たままのもの」、つまり**数値や文字などの値そのもの**のこと。

- 数値リテラル
  - `123`
  - `12345u32` 末尾に型をつけることもできる
  - `12_345_u32` アンダースコアで区切ることもできる
  - `0xffff`
  - `1.23` など
- 文字列リテラル
  - `"Hello, world!"`
  - 型は`str`、実体はバイト列 `[u8]`
  - バイナリに埋め込まれ、実行時には Static Memory に格納されたうえ、そこへの参照が変数にセットされる。
  - 文字列型**ではない**。なお Rust には文字列型は**ない**かわりに String というライブラリで表現される。
  - 文字列に関するごちゃごちゃの分かりやすい説明 -> https://qiita.com/k-yaina60/items/4c8e3562fe6d22f845a9
- char 型リテラル
  - `'a'`, `'あ'` など
- bool 型リテラル
  - `true` 又は `false`

## 文と式

- 文 / Statement
  - 値を返さない
  - `;`で終わる
- 式 / Expression
  - 値を返す
  - `;`は不要
  - 例
    - スカラ値
    - マクロ呼び出し
    - 末尾に`;`のない関数呼び出し
    - 末尾に`;`のないスコープ

## 関数

関数は小文字のスネークケースで命名する。可変長の引数はサポートされない（マクロでは利用可能）。

Tips として、`expected hogehoge, found "()"` というエラーは、return しわすれたときによく出るので覚えておくと良い。これは、if 式や while 式自体が空の Tuple`()`を返すことに起因している。

```rust
// シンプルな関数
fn say_hello() {
    println!("hello!")
}

// 引数あり
fn say_hello(num: i32) {
    println!("number is {}", num)
}

// 引き数あり(値を書き換えてから関数内で利用したい場合)
// - 変更した値はスコープ内でのみ有効で、呼び出し元には反映されない
// - mutの位置に注意
fn mutate_number(mut y: i32) {
    y - 1;
    println!("{}", y)
}

// 引き数あり(呼び出し元の値を書き換えたい場合)
// - mutの位置に注意
// - `&`に注意
fn mutate_number(y: &mut i32) {
    *y = 64;
}

// 戻り値あり（returnを使う場合）
fn say_hello() -> i32 {
    return 32;
}

// 戻り値あり（式を使う場合）
fn say_hello2() -> i32 {
    32
}
```

## クロージャー

関数の中などに入れ子になっている匿名関数のこと。クロージャが定義されたスコープに存在する変数や値を**キャプチャ**（参照または所有権を取得）できる。引数や返り値の型は全て推論される。以下は全てクロージャーの例。

```rust
|x, y| { x + y };
|| { x + y };
|| {};
|| 123;
```

以下のようにスコープにある値を使える。

```rust
let s = "🍓".to_string();
let f = || {
    println!("{}", s)
};
f();
```

ただしこのままだとクロージャーを返り値として返したり、別スレッドに渡したりすると問題が起きる。なぜならクロージャーで使った値(上記でいうと`s`)がドロップされるかもしれないからだ。解消法としては`move`を使って所有権を移すことが挙げられる。こうしておけば使った値はクロージャーと一蓮托生となり、クロージャーをどこで使っても問題は起きなくなる。

```rust
let f = move || { /* ... */ };
```

クロージャーの型は以下のように記述する。

```rust
fn make_closure() -> impl Fn() -> i32 {
    let v = 1234;
    let f = move || v;
    return f;
}
```

## フロー制御

Rust では条件式を`()`で囲む必要はない。 `{`までの間にある記述が条件式として扱われる。

### if

```rust
if age >= 35 {
    println!("大人");
} else if age >= 18 {
    println!("若者");
} else {
    println!("子供");
}
```

if は式なので代入もできる。その際はセミコロンを省略すること。return は使えない、全てのブロックで同じ型を返さなければならない点に注意。

```rust
let num = if true {
    5
} else {
    6
};
```

### match

パターンマッチングが行える。

```rust
let number = 1;
let result = match number {
    1 => "1です",
    2 => "2です",
    _ => "その他です"
};
```

アームの左辺に変数を置いたうえで、if 文を使った分岐をすることもできる。この if 文をガードという。

```rust
let number = 1;
let result = match number {
    x if x < 10 => "10より小さい",
    x if x < 20 => "20より小さい",
    _ => "20以上"
};
```

Enum と match を組み合わせたときの使い方は[Enum](#enum)の項を参照。

### for

for 文には従来の言語のような初期化、条件、繰り返し前処理のような構文はない。`break` が使える。

`iter()` はイテレータを返す。配列のように順番があるものは順番通りに、Map のようなものは順番がないものはランダムに取り出される。

```rust
for thisNumber in [10, 20, 30, 40, 50].iter() {
    println!("the value is: {}", thisNumber);
}
for thisNumber in 0..50 {} // 0から49まで
for thisNumber in 0..=50 {} // 0から50まで
```

### loop

```rust
loop {
    // do something
}
```

loop では`break`や`continue`が使える。入れ子のループからそれらを行うときは、識別のために[tick identifier](https://dhghomon.github.io/easy_rust/Chapter_26.html)が使える。また、`break` 時に値を返すこともできる。

```rust
let number = loop {
    break 100
}
```

### while

基本的な動きは loop と同じ。

```rust
while number != 0 {
    // do something
}
```

### range

```rust
for number in (1..4) {
    // do something
}
```

## Slice

Slice には 2 種類ある。

まずは String Slice(`&str`)である。これは文字列リテラルへの参照や、`String`の一部分に対する参照である。

つぎに Array Slice(`&[T]`)である。これは配列`[T]`の一部分に対する参照か、ベクタ`Vec<T>`の一部分に対する参照である。

```rust
// String Slice
let my_string: String = "hello world".to_string();
let my_string_slice: &str = &my_string[1..5]; // -> 'ello'

// Array Slice
let numbers = [1, 2, 3, 4, 5];
let numbers_slice: &[i32] = &numbers[1..3]; // -> [2, 3]
```

## Struct

```rust
struct User {
    username: String,
    sign_in_count: u32,
}

const shota = User {
    username: String::from("shota"),
    sign_in_count: 23,
}
```

TS でおなじみの省略記法も使える。ドットは２個なので注意。

```rust
let default_user = User { /* 省略 */ };
let user = User {
    username, // プロパティ名と設定したい変数名が同じ場合は省略できる
    ..default_user, // デフォルト値を使いたい場合はこうする
}
```

構造体をプリントするには Debug トレイトを実装する必要がある

```rust
#[derive(Debug)]
struct User { /* */ }

let user = Rectangle { /* */ };
println!("rect is {:?}", rect);
```

### メソッドと関連関数

メソッド / Methods は self を引数にとる。インスタンスメソッドのようなもの。

関連関数 / Associated functions は self を引数にとらない。クラスメソッドのようなもの。

構造体にはクラスのような「継承」の概念はない。なぜなら、トレイトを使うほうが優れていると判断したからだ。

```rust
struct Rectangle {
  width: u32,
  height: u32,
}

impl Rectangle {
  // 関連関数
  fn new() -> Self {
    Self {
      width: 10,
      height: 10,
    }
  }

  // メソッド
  fn can_hold(&self, other: &Rectangle) -> bool {
    self.width > other.width && self.height > other.height
  }
}
```

### 特殊な構造体

- Tuple 構造体
  - 構造体のフィールド名自体にはさほど意味がないようなときに使う

```rust
struct Ipv4(u8, u8, u8, u8);
let address = Ipv4(192, 168, 1, 100);
```

- Unit-like 構造体
  - 構造体に値がまったくないときやトレイトの実装で役立つ？詳細不明

## Trait

Trait とは特性や特質のこと。複数の型にまたがって共通の振る舞いを定義するための仕組みである。Composition over Inheritance という考え方に基づいている。なお、Trait は構造体のみならず組み込み型に対しても実装できる。

```rust
struct Position {
    x: f64,
    y: f64,
}

pub trait Summary {
    fn summarize(&self) -> String;
}

impl Summary for Position {
    fn summarize(&self) -> String {
        format!("x: {}, y: {}", self.x, self.y)
    }
}
```

直接実装するのと Trait を介して実装することの違いは、Trait を介せばジェネリック関数を活用できるようになるという点である。Trait を持つ構造体をなんでも受け取るジェネリック関数は以下のように定義することができる。

```rust
fn notify<T: Summary>(item: T) {
    println!("Breaking news! {}", item.summarize());
}
// 以下のようにも書ける？
fn notify(item: impl Summary) {
    println!("Breaking news! {}", item.summarize());
}
```

Trait にはデフォルト実装を持たせることもできる。

```rust
pub trait Summary {
    fn summarize(&self) -> {
      println!("This is default summary...");
    }
}
impl Summary for Position {} // デフォルト実装を生かしたいときは単に実装を書かなければ良い
```

構造体は継承関係を持つことができる。Trait A が祖先に Trait B, Trait C を持つ場合には、Trait A を実装した型は、Trait A/B/C のすべてのメソッドを実装する必要がある。

代表的な Trait には以下のようなものがある。

- Copy trait
  - 代入時などに値のコピーが行われるようにする
- Display trait
  - ある型の値をユーザーフレンドリーな文字列形式で出力するためのもの。`println!`の`{}`で表示することができる。
- Debug trait
  - ある型の値をデバッグ用の文字列形式で出力するためのもの。`println!`の`{:?}`や`{:#?}`で表示することができる。後者はより見やすい形式で表示する。

## Enum

列挙した値を列挙子(Variant)とよぶ。構造体はフィールドの集合に対して AND の関係であり、列挙型は OR の関係であるといえる。Rust の Enum はメソッドを持てたり、列挙子ごとに値を持つことができる点で強力である。

```rust
enum SampleEnum {
    Quit,
    Message(String), // 単一の型
    Color(String, i32), // 複数の型(Tuple)
    Position { x: i32, y: i32 }, // 匿名の構造体
}

impl SampleEnum {
    fn output_message(self: &Self) -> String {
        "Do something...".to_string()
    }
}
```

単一の列挙子だけを処理をしたいときには、`if let`を使うことができる。

```rust
let maybe_message = SampleEnum::Message("hello".to_string());
if let SampleEnum::Message(message) = maybe_message {
    println!("message is {}", message);
}
```

複数の列挙子に対して処理を行いたいときには、`match`を使うことができる。

```rust
let maybe_message = SampleEnum::Message("hello".to_string());
match maybe_message {
    SampleEnum::Message(message) => println!("message is {}", message),
    SampleEnum::Quit => println!("quit"),
    _ => println!("not a message"),
}
```

### Option 型

Null になりうる値は Option 型として使う必要がある。値を取り出すにはパターンマッチングか unwrap メソッドなどを使う。Option, Some 及び None は接頭子なしで使用できる。

```rust
// Option型の定義
enum Option<T> {
    Some(T),
    None,
}

// 使い方の例
let mut maybe_number: Option<i32>;
maybe_number = None;
maybe_number = Some(5);

// 便利な関数
maybe_number.is_some(); // -> bool
maybe_number.is_none(); // -> bool
```

### Result 型

プログラムを止めるまでもないエラーの場合に使われる型である。`Result`, `Ok`, `Err`は接頭子をつけずに使える。

```rust
enum Result<T, E> {
  Ok(T),
  Err(E),
}
```

Result の中身を取り出す方法は以下の通り。

```rust
use std::fs::File;
use std::io::Error;

let result = File::open("hello.txt");

// あらかじめ成否を判定したいとき
if result.is_ok() { /* 成功したとき固有の処理 */ }
if result.is_err() { /* 失敗したとき固有の処理 */ }

// 結果を取得する(失敗時には呼び出し元にエラーの委譲を行う)
let f = result?

// 結果を取得する(失敗時にはリカバリする)
let f = result.unwrap_or_else(|e| { /* リカバリ */ });

// 結果を取得する(失敗時にはフォールバック値を設定する)
let f = result.unwrap_or(12345);

// 結果を取得する(失敗時にはパニックする。基本的に避けるべき。)
let f = result.unwrap();
let f = result.expect ("Failed to open hello.txt"); // メッセージを添えたい場合

// 前述のコードの大半は、以下コードの糖衣構文である
match result {
  Ok(file) => file,
  Err(e) => /* ここでリカバリしたり、パニックしたり、エラーやデフォルト値を返したりしているのと同じ */,
};

// 結果は不要でリカバリのみを行う場合
if let Err(e) = result { /* リカバリ */ };
```

## Collections

Collections とは、複数の値を可変長で保持できる型である。Array や Tuple と異なりヒープメモリに保持されるため、コンパイル時にサイズを確定させなくてもよい。

### Vector

Vector は同じデータ型の値を複数持つことのできるコレクションで、型は`Vec<T>`である。異なるデータ型を混在させることはできない。また、値の順序が維持される。

```rust
let v: Vec<i32> = Vec::new(); // 初期値がない場合は型注釈が必要
let v = vec![1, 2, 3]; // 初期値がある場合は型注釈は不要
```

値の追加には`push`メソッドを使う。

値の取得には`[]`を使う方法と`get`メソッドを使う２種類の方法があり、いずれも最終的には参照を取得する。

```rust
// 結果を&Tとして受け取る
// 存在しなければパニックになる
let third = &v[2];

// 結果をOption<&T>として受け取る
// 存在しなければNoneを返し、存在すればSome(&T)を返す。
let third = v.get(2);
```

反復処理を行う際は参照(`&Vec<T>`)を使ってループする。for に値をそのまま与えると所有権が移転するため。

```rust
let v = vec![1,2,3];

// 不変
for i in &v {
  println!("{}", i);
}

// 可変
let mut v = vec![1,2,3];
for i in &mut v {
  *i += 50;
}
```

異なる型を Vector に保存したい場合は、予め Enum として作成しておくことで対応する。

```rust
enum SpreadsheetCell {
    Int(i32),
    Float(f64),
    Text(String),
}

let row = vec![
    SpreadsheetCell::Int(3),
    SpreadsheetCell::Text(String::from("blue")),
    SpreadsheetCell::Float(10.12),
];
```

### String

Rust の文字列にはいくつかの種類ある。

まず、**String literal**(`str`)型がある。これは、Rust で唯一の組み込みの文字列型である。組み込みとは、言語の核心部分に統合されている、という意味である。String literal はバイナリに組み込まれる完全に変更不可能なものであり、実のところ String literal はそこへの参照(String slice)としてしか存在できない。

次に、**String slice**(`&str`)型がある。これは String literal や String への参照である。ptr, len をもつ。

最後に、**String**(`String`)型がある。これはライブラリにより提供されており、拡張、変更、所有が可能である。ptr, len, cap をもつ。

rust の世界で String と言った場合、String 型または String slice を指すことが多い。どちらも UTF-8 で制御される。

String の作り方は以下のとおり。

```rust
let s = "aaa".to_string();
let s = String::from("aaa");
```

末尾に文字列を追加するには`push_str()`を使う。この関数は`&str`型を引数として取るので、所有権の移転は発生しない。

```rust
let mut s = String::from("foo");
s.push_str("bar");
```

文字列の結合を行うには 2 つの方法がある。

一つ目は`+`を使う方法である。このとき、`s1`の所有権は s に移る。再利用されることで、すこし効率的である。`+`の後に与えることができるのは`&str`型であるため、所有権の移転は発生しない。なお、`&String`は deref coercion という仕組みによって`&str`に自動的に変換される。

```rust
let s1 = String::from("tic");
let s2 = String::from("toe"); // String型
let s3 = "tac"; // &str型

let s = s1 + "-" + &s2 + "-" + s3;
// &s2は&String型だが、&str型に自動的に変換される
```

2 つめの方法は`format!`を使う方法である。この場合は所有権の移転は一切発生しない。

```rust
let s = format!("{}-{}-{}", s1, s2, s3);
```

rust の内部では文字列は byte(`vec<u8>`)でとして保持されている。

```rust
// 表現したい文字列
"नमस्ते"

// byteで表す
[224, 164, 168, 224, 164, 174, 224, 164, 184, 224, 165, 141, 224, 164, 164, 224, 165, 135]

// Unicode scalar value(コードポイント)で表す
['न', 'म', 'स', '्', 'त', 'े']

// grapheme clusters(人間が目にする文字)で表す
["न", "म", "स्", "ते"]
```

String に対して繰り返し処理をしたい場合は以下のようにする。イテレータとして取り出した後は、for 文で回すことも可能だし、`.nth()`を使ってインデックスでアクセスすることも可能である。String に対して直接インデックスを使ったアクセスをすることは可能ではあるものの、良いアイディアとは言えない。

```rust
// Unicodeスカラ値の単位で取り出して繰り返す
for c in "नमस्ते".chars() {}

// byte単位で取り出して繰り返す
for b in "नमस्ते".bytes() {}

// graphene clustersで取り出して繰り返すには外部ライブラリが必要
```

### Hash Map

Hash Map の作り方は以下の通り。

```rust
use std::collections::HashMap; // 明示的にインポートする必要がある

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);
```

複数の vector を zip して作成することもできる。この場合、双方の型に Eq トレイトと Hash トレイトが実装されている必要がある。`<_, _>`は型推論を意味する。`zip()`もまたイテレータを返すので、`collect()`で HashMap に変換できる。

```rust
let teams = vec![
  String::from("Blue"),
  String::from("Yellow")
];
let initial_scores = vec![
  10,
  50,
];
let scores: HashMap<_, _> =
    teams.into_iter().zip(initial_scores.into_iter()).collect();
```

値の取得は以下のようにする。`Option<T>`型が得られる。

```rust
let score = scores.get("Blue");
```

イテレーションは以下のようにする。参照にしないと Hash Map の所有権が移動してしまうので注意。

```rust
for (key, value) in &scores {}
```

値の更新は以下のようにする。

```rust
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);

// 上書き
scores.insert(String::from("Blue"), 25);

// 既存のデータを使って上書き
let count = scores.entry("Blue").or_insert(0);
*count += 1;

// 値がなければ挿入、あれば何もしない
scores.entry(String::from("Blue")).or_insert(50);
```

## Threads / スレッド

Rust のスレッドは Mac でも Linux でも Windows でも動作する。スレッドを使うと CPU のコンテキストスイッチ等でオーバーヘッドが発生する点に注意。Disk I/O やネットワーク I/O などの I/O を待つ場合などは、スレッドではなく async / await を使ったほうがずっと効率的である。

```rust
use std::thread;

fn main() {
    let handle = thread::spawn(move || {
        // 子スレッドで何かやる
    });
    // 同時にメインスレッドでも何かやる

    // スレッドが完了するのを待ち、結果を受けとる
    let result = handle.join().unwrap();
}
```

チャンネルを使うときは crossbeam というクレートを使え。`std::sync::mpsc`というプリミティブなものもあるがお勧めしない。

## エラー

rust には 2 種類のエラーがある。他の言語ではこれらは区別されないことが多い。

リカバリ可能なエラーには`Result<T, E>`型を使う。詳細は前述の通り。例えば、ファイルが見つからなかった場合など。

リカバリ不可能なエラーには`panic!`マクロをつかう。例えば、Array の範囲外にアクセスした場合など。

### panic!

panic の発生時に Backtrace を取得するには、下記のように実行する。

```sh
RUST_BACKTRACE=1 cargo run
RUST_BACKTRACE=ful cargo run # かなり詳細に見たいとき
```

### panic と Result の使い分け方

#### ユースケースごとの使い分け

- サンプルコード、プロトタイプコード、テストコードの場合
  - panic(unwrap, expect) が最適。
  - 意図が明確になるため。テストコードを適切に失敗させるため。
- 開発者がコンパイラよりも情報を持っており、正しさを確信できる場合
  - 例えば、下記は常に正しいので panic してよい。
    ```rust
    let home: IpAddr = "127.0.0.1".parse().unwrap();
    ```
  - 逆に、IP アドレスがユーザ入力等で与えられる場合は Result を使って処理する。

#### エラー処理のガイドライン

- パニックが最適
  - 悪い状態(前提、保証、契約、不変性が破られた状態)である、かつ以下のいずれかを満たす場合
    - その悪い状態が絶対に起きてはならないことである
    - その時点以降、良い状態であることを前提にコードが書かれている
    - 型を使って問題の発生を防ぐ方法がない
- Result が最適
  - 失敗が予想されるとき(HTTP リクエストなど)

#### panic の使用例 (検証のための独自型)

下記では値が 1 から 100 の間であることを保証している。

```rust
struct Guess {
    // この値は基本的に非公開
    value: u32,
}

impl Guess {
    pub fn new(value: u32) -> Guess {
        if value < 1 || value > 100 {
            panic!("Value must be between 1 and 100, got {}.", value);
        }

        Guess {
            value
        }
    }

    pub fn value(&self) -> u32 {
        self.value
    }
}

let g = crate::Guess::new(0);
println!("{}", g.value);
```

## Generics / ジェネリクス

**ジェネリクス**とは、単一のコードで異なるデータ型の処理を可能にする便利な仕組みのこと。

**型パラメーター**とは以下のように`<>`で囲まれた識別子のことで、ジェネリクスにおいて型を指定するときに指定されるパラメーターのこと。なお、言語によっては「型引数(渡す側)」と「型パラメーター(受け取る側)」を用語として区別することがあるが、rust では区別しない。

```rust
Vec<i32> // i32型のVector
HashMap<i32, String> // i32型のキーとString型の値を持つHashMap
```

ジェネリクスにより定義された型のことを**ジェネリック型**と呼び、例えば`Vec<i32>`がそれにあたる。

ジェネリクスの具体的な書き方は以下の通り。

```rust
//  構造体
struct Point<T> {
    x: T,
    y: T,
}

// 列挙型
enum Option<T> {
    Some(T),
    None,
}

// 関数
fn average<T>(list: &[T]) -> T {
    // ここで平均を計算して返す
}
```

構造体のメソッドにジェネリクスを使う場合は以下のようにする。

```rust
impl<T> Point<T> {
    fn just_get_x_ref(&self) -> &T {
        &self.x
    }
}
```

ジェネリクス型が特定のトレイトを実装していることを前提とする制限を設けることを**トレイト境界**といい、`<T: Trait>`のように書く。トレイトによって線引きをしているためそのように呼ぶ。以下は、メソッドに対してトレイト境界を作る一例。

```rust
impl<T: Display> Point<T> {
    fn pretty_output(&self) {
        println!("Hi! value is x:{} y:{}!", self.x, self.y);
    }
}
```

## メモリのはなし

- 参考
  - https://doc.rust-lang.org/1.30.0/book/first-edition/the-stack-and-the-heap.html (なぜか現行版では消されている)
  - https://qiita.com/k-yaina60/items/26bf1d2e372042eff022
  - https://cipepser.hatenablog.com/entry/rust-memory
  - https://doc.rust-lang.org/std/primitive.slice.html

### Static memory / 静的メモリ

- 生成された実行バイナリに含まれる
- プログラムの開始から終了までずっと存在し続ける
- 静的領域 / static memory / rodata (read-only data) segment などと呼ばれる
- スタックメモリでもヒープメモリでもない特殊な領域
- 格納対象
  - 文字列リテラル (`str`)
  - `static`をつけて宣言した値
    - e.g. `static FOO: usize = 42;`

### Stack memory / スタックメモリ

- 🟢 速い
- 🔴 呼び出し元はローカル（単一の関数内）に限られる
- 🔴 サイズに上限がある
- Stack Frame とも呼ばれる
- rust の値はデフォルトでここに保持される
- 格納対象
  - 「Box, Vec, String のデータ本体」以外のすべて。具体的には以下の通り。
    - 整数型、浮動小数点型、論理値型
    - 参照 / `&T`
    - Array/`[T]`, Tuple/`()`, Struct
      - ただし、参照先はヒープメモリ上に存在する可能性がある
        - Array が Vec を内包する場合、Array は Vec のメタデータ群を持つことになり、そのメタデータ群はスタックメモリ上に一直線に隙間なく並んでいる。
    - スライス/`&[T]`
      - (ptr,len)をもつメタデータである
      - ただし、参照先はヒープメモリ上に存在する可能性がある
    - Box/`Box<T>`, Vector/`Vec<T>`, String/`String` のメタデータ部分
      - (ptr, len, cap)をもつ
      - メタデータは変数とバインドされ、所有権管理に利用される
      - 変数が破棄されれば[Drop trait](https://doc.rust-lang.org/1.30.0/book/first-edition/drop.html)の働きにより参照先のデータも破棄される

### Heap memory / ヒープメモリ

- 🔴 遅い
- 🟢 グローバルに利用できる
- 🟢 サイズに上限がない
- 格納対象
  - `Box<T>`, `Vec<T>`, `String` のデータ本体

### Vector | Array | Slice とメモリの関係

- Vector
  - 型は`Vec<要素の型>`
- Array
  - 型は`[要素の型; 要素数]`
- Slice
  - 型は`&[要素の型]`、可変なら`&mut [要素の型]`

メモリ使用量は以下の通り

```rust
// プリミティブな型のバイト数は、そのサイズになる。当たり前。
assert_eq!(std::mem::size_of::<i8>(), 1);
assert_eq!(std::mem::size_of::<i32>(), 4);
assert_eq!(std::mem::size_of::<i64>(), 8);

// 前提として、64bitアーキテクチャだとメモリの単位は8バイトである。
let pointer_size = std::mem::size_of::<usize>();
assert_eq!(pointer_size, 8);

// Arrayのメモリ占有量は内容物の総計になる。メタデータは存在しない。
assert_eq!(std::mem::size_of::<[i8; 10]>(), 1 * 10);
assert_eq!(std::mem::size_of::<[i32; 10]>(), 4 * 10);
assert_eq!(std::mem::size_of::<[Vec<i32>; 10]>(), pointer_size * 3 * 10);

// Tuple,Structのメモリ占有量も、基本的に内容物の総計になる。メタデータは存在しない。
// AlignmentやPaddingが発生するので、きっちり合計値とはならないこともある。
  assert_eq!(std::mem::size_of::<(Vec<String>, i64)>(), 32);
  assert_eq!(std::mem::size_of::<(Vec<String>, i64, i8, i8)>(), 40); // padding発生

// Sliceのメモリ占有量は常に8*2byte (ptr,len)になる。
// Sliceの型は配列から作ろうがVecから作ろうが`&[T]`になる点に留意せよ。
assert_eq!(std::mem::size_of::<&[i8]>(), pointer_size * 2);
assert_eq!(std::mem::size_of::<&[i32]>(), pointer_size * 2);
assert_eq!(std::mem::size_of::<&str>(), pointer_size * 2);
assert_eq!(std::mem::size_of::<&[String]>(), pointer_size * 2);

// Vectorのメタデータ部分のメモリ占有量は常に8*3byte (ptr,len,cap)になる。
// なおデータ部分のメモリ占有量は内包する要素の種類と数によって定まるが、ここでは割愛する。
assert_eq!(std::mem::size_of::<Vec<u8>>(), pointer_size * 3);
assert_eq!(std::mem::size_of::<Vec<i32>>(), pointer_size * 3);
assert_eq!(std::mem::size_of::<Vec<String>>(), pointer_size * 3);
```

## 所有権

所有権は、Rust がガベージコレクションを使用せずにメモリ安全性を保証する方法のこと。所有権のルールは以下の 3 つ。

1. 値はその値の所有者を持つ。所有者のいないメモリ上のデータは無意味であり、存在しないのと同じである。
2. ある時点で所有権を持つことができるのは一つの変数のみである。代入したり関数に渡したりすると、元の変数は即時に無効化され使えなくなる。
3. 所有者がスコープから外れると、値は破棄される。具体的には、もしあればデストラクタが実行され、ヒープメモリは開放され、スタックメモリはポップされる。

### 所有権の移動 / Move

Rust では、値を別の変数に代入すると、デフォルトで所有権の移動が発生する。これは、元の変数から新しい変数へ所有権が移動することを意味する。これにより、元の変数はその値を使用できなくなる。

ただし Copy Trait があるものは所有権が移転しない。対象は以下の通り。

- 不変参照 (`&T`)
- プリミティブな値
- (Copy Trait を持つ型のみを含む) Tuple
- (Copy Trait を持つ型の) Array
- (Copy Trait が明示的に実装された) Struct

Copy Trait がないものは所有権が移転する。対象は以下の通り。

- 可変参照 (`&mut T`)
- Vec, Box, String
- (Copy Trait を持たない型を含む) Tuple
- (Copy Trait を持たない型の) Array
- (デフォルトの) Struct

### 参照と借用

所有権を移動せずに値を使いたい場合には、変数そのもの(=所有権+アクセス権)ではなく変数への(可変|不変)参照を使うことで、所有権は渡さずにアクセス権だけを渡すことができる。この仕組みを借用という。

`.`を使う場合は自動で参照外しが行われるので、明示的に`*`を使う必要はない。ただし、値を丸ごと書き換える場合などには必要となる。

```rust
fn main() {
    let mut greeting = "hello".to_string();
    add_world(&mut greeting);
    println!("{}", greeting); // hello world
}

fn add_world(original_string: &mut String) {
    original_string.push_str(" world");

    // 上書きなど`.`を使わないときには明示的な参照外しが必要
    *original_string = "hello world".to_string();
}
```

#### 借用規則

不変参照(`&`)のライフタイムが尽きていない状態で可変参照(`&mut`)は存在することができない。その逆も然りで、可変参照が存在する状態で不変参照は存在することができない。

不変・可変に関わらず、参照が存在する場合は値に**直接**アクセスしてその値を変更することはできない。また、可変の参照が存在するならば、可変の参照を通じてしか変更ができない。

これらの規則により**不変参照の不変性が保証**される。また、値の**変更のインタフェースは常に一つだけ**になることが保証される。

参考: https://blog-mk2.d-yama7.com/2020/12/20201230_rust_lifetime/

#### ライフタイム

参照は、参照先の値のスコープの外で使用されてはならない。なぜならスコープを超えると**ダングリング参照**と呼ばれる無効な参照となるためである。

Rust ではダングリング参照の発生をさせないための仕組みとして、**ライフタイム**という概念がある。ライフタイムは参照の有効期間を表し、Borrow Checker によってチェックされる。

**ライフタイム注釈**とは、参照を受け取って参照を返す関数などにおいて、コンパイラがライフタイムを計算できないケースがあり、そのときは明示的に書いてあげなければいけないということ。コンパイラに怒られたら、追記してあげるくらいの気持ちで OK。

参考: https://zenn.dev/ucwork/articles/6de5c9c2257f2d

## プロジェクト構造とパッケージ管理

以下が分かりやすい。以降、このドキュメントに記載がない事柄だけを記載した。
https://zenn.dev/mebiusbox/books/22d4c1ed9b0003/viewer/c12c17

### Crates

**Crate** とは Rust プログラムの基本的なコンパイル単位である。実行可能なバイナリを作る **Binary Crate** と 再利用可能なライブラリを作る **Library Crate** の 2 種類がある。

**Crate root** とは、ある Crate においてコンパイラが最初に読み込む起点となるファイルのこと。

Binary Crate を作成したい場合は、Crate Root として`src/main.rs` を作成する。この Crate は`cargo run`でデフォルトで実行されるため、暗黙の Crate といえる。

複数の Binary Crate を作成したい場合は、`src/bin/**.rs`を作成することで、それぞれが Crate Root となる。Binary Crate の数に制限はない。

Library Crate を作成したい場合は、Crate Root として`src/lib.rs` を作成する。Library Crate は 1 つだけしか作れない。ライブラリなので`cargo run`しても実行はできず、`cargo build`でのコンパイルが必要となる。

`lib.rs`にロジックを書いて、それを`main.rs`から呼び出す構成は、よくあるパターン。

```rust
// main.rs
fn main() {
    // my_crateはCargo.tomlに記載されているパッケージ名を指す
    my_crate::my_function();
}

// lib.rs
pub fn my_function() {
    println!("Hello, world!");
}
```

### Packages

Package は一つ以上の crate で構成され、なんらかのまとまった機能を提供する。`cargo.toml`を含み、ここには crate のビルド方法が書かれている。

### Modules

下記のようにすると、他のモジュールを利用できる。

```rust
use crate::M1::M2;

// - 絶対パスでも相対パスでもOK
// - 以降、`M2::***`のように使える
```

モジュールにおいては、兄弟と親の位置にある要素にはアクセスできるが、それ以外は非公開となる。モジュール内にある構造体は、フィールドやメソッドまで含めて非公開となるので注意する。一方、enum の列挙子はデフォルトで公開される。いずれも、`pub` を明示的につけることで公開できる。

```rust
pub mod M1 {
    pub mod M2 {
        pub mod M3 {
            pub fn hoge() {}
        }
    }
}
```

慣例として、関数はひとつ上のモジュールを読み込む。これは、関数がローカルのものではないことを明確にするため。

```rust
use crate::M1::M2;
M2::add_to_waitlist();
```

慣例として、Enum の場合はそれ自身を読み込む。特に理由はない。

```rust
use std::collections::HashMap;
let mut map = HashMap::new();
```

名前が重複する場合はそのひとつ上のモジュールから読み込む。

```rust
use std::fmt;
use std::io;

fn function1() -> fmt::Result {...}
fn function2() -> io::Result {...}
```

もしくは下記のように別名をつける。

```rust
use std::io::Result as IoResult;
```

`pub use`とすると再エクスポートできる。これをモジュールの再公開という。

```rust
// 外部のコードから`M2`を呼び出せるようになる
pub use crate::M1::M2;
```

外部ライブラリを使いたいときは、`Cargo.toml`に記載したうえで`use`する。

```toml
[dependencies]
rand = "0.8.3"
```

例えば以下のようにすることで、Rng トレイトに含まれる`thread_rng`メソッドを使えるようになる。

```rust
use rand::Rng;
let rng = rand::thread_rng()
```

省略記法

```rust
use std::io;
use std::io::Write;
use std::io::Read;

// 上記は下記の通り書ける
use std::io::{self, Write, Read}
```

glob operator も使えるが、基本的にテストでのみ使用すること。見通しが悪くなるため。

```rust
use std::collections::*;
```

### Workspaces

複数のパッケージにまたがるプロジェクトを管理するための仕組み。yarn の workspaces と同じようなもの。Cargo.toml に以下のように記載したのち、サブフォルダにそれぞれのプロジェクトを作成していく。成果物はルートの `target` フォルダにまとめられる。

```toml
[workspace]
members = [
    "my_tools",
    "my_libs",
]
```

サブフォルダにあるプロジェクト間でコードを利用するときは、サブフォルダの Cargo.toml に以下のように記載することで、`my_libs::hoge`のような書き方で使えるようになる。なお、以前は`extern crate my_libs`という記述が必要だったが、現在は不要である。

```toml
[dependencies]
my_libs = { path = "../my_libs" }
```

(詳細は必要になったときに以下を読む)
https://atmarkit.itmedia.co.jp/ait/articles/2207/22/news002.html

## テスト

[Ultimate Rust 2](./rust-ultimate.md#testing) の方を参照のこと。

## クロスコンパイル

[cross](https://github.com/cross-rs/cross)を使うのが一番カンタン。

- `rustup target list` 対象として指定可能なプラットフォームを一覧表示
- `rustup target add <platform>` プラットフォームを追加して必要なファイルをダウンロード(cross 使うならこの作業は不要)
- `cross test --target <platform>` プラットフォームを指定してテスト (`cargo`と間違えないように)
- `cross build --target <platform>` プラットフォームを指定してビルド (`cargo`と間違えないように)
