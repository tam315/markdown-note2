# Rust

## コメント

- `//`と`/* */`が使える。
- `///`を使うと[ドキュメンテーションコメント](https://doc.rust-lang.org/rust-by-example/meta/doc.html)になる
  - マークダウンで書いたコメントが HTML ドキュメントになる

## 変数と可変性

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
- `mut`はあくまで同じ型だが、シャドーイングは型を変更できる
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

大きくわけてスカラー型と複合型がある。

### スカラー型

スカラー型には基準型がある。基準型というのは、型注釈のない変数宣言などで、優先して選択されるデータ型のこと。

- 整数
  - `i8`, `u8`, `i16`, `u16`, `i32`, `u32`, `i64`, `u64`, `isize`, `usize`
  - 基準型は`i32`
- 浮動小数点数
  - `f32`(単精度浮動小数点数), `f64`(倍精度浮動小数点数)
  - 基準型は`f64`
- 論理値型
- 文字型
  - `char` 型
  - シングルクオートで表す
  - ユニコードにおける 1 つのスカラー値
  - よって世間一般的な「文字」とは離れた性質のものも含まれる(e.g. ゼロ幅スペース)

### Tuple 型（複合型）

```rust
let tup: (i32, f64, u8) = (500, 6.4, 1);
// or
let tup = (500, 6.4, 1);

// 分配と呼ばれる代入方法
let (x, y, z) = tup;

// 0番目の要素にアクセス
let five_hundred = x.0;
```

### Array 型(複合型)

```rust
let a = [1, 2, 3, 4, 5];

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

### 型推論

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
  - 型は`&str`、実体はバイト列の Slice `&[u8]`
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

- 命名規則は小文字のスネークケース
- `expected hogehoge, found "()"` というエラーは、return しわすれたときによく出る
  - if 式や while 式自体が空の Tuple`()`を返すことに起因している

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

## フロー制御

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

式なので代入もできる。その際はセミコロンを省略すること。

```rust
let num = if true {
    5
} else {
    6
};
```

### match

パターンマッチングが行える。詳細後述。

```rust
let letter = 'A';
let str = match letter {
    'A' => "Aです",
    'B' | 'C' | 'D' => "B、C、Dのいずれかです",
    '0'..='9' | 'A'..='F' => "16進数でつかえます",
    _ => "いずれでもない文字です",
};
println!("{}は{}です。", letter, str);
```

### for

- 初期化、条件、繰り返し前処理のような構文はない
- `break` が使える

```rust
let numbers = [10, 20, 30, 40, 50];
for thisNumber in numbers.iter() {
    println!("the value is: {}", thisNumber);
}
```

### loop

```rust
loop {
    // do something
}
```

- `break`が使える
  - 唯一、`break` 時に値を返すこともできる。返さなくてもいい。

```rust
let number = loop {
    break 100
}
```

### while

- `break` が使える

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

## メモリのはなし

- 参考
  - https://doc.rust-lang.org/1.30.0/book/first-edition/the-stack-and-the-heap.html (なぜか現行版では消されている)
  - https://qiita.com/k-yaina60/items/26bf1d2e372042eff022
  - https://cipepser.hatenablog.com/entry/rust-memory
  - https://doc.rust-lang.org/std/primitive.slice.html

### Static memory / 静的メモリ

- 生成された実行バイナリに含まれる
- プログラムの開始から終了までずっと存在し続ける
- 静的領域/ static memory / rodata (read-only data) segment などと呼ばれる
- スタックメモリでもヒープメモリでもない特殊な領域
- 格納対象
  - 文字列リテラル
  - `static`をつけて宣言した値
    - e.g. `static FOO: usize = 42;`

### Stack memory / スタックメモリ

- 🟢 速い
- 🔴 呼び出し元はローカル（単一の関数内）に限られる
- 🔴 サイズに上限がある
- Stack Frame とも呼ばれる
- rust の値はデフォルトでここに保持される
- 格納対象
  - 整数型、浮動小数点型、論理値型、参照
  - Tuple、Array、Slice、Struct
    - これらが参照する先の値が最終的にヒープメモリに存在するとしても、これらが直接保持する値はすべてスタックメモリ上にある
    - e.g. Array が Vec を内包するとしても Array は Vec のメタデータしか持たない。また、そのメタデータ群はスタックメモリ上に一直線に隙間なく並んでいる

### Heap memory / ヒープメモリ

- 🔴 遅い
- 🟢 グローバルに利用できる
- 🟢 サイズに上限がない
- 格納対象
  - `Box<T>`, `Vec<T>`, `String` のデータ本体
    - メタデータ(ptr, len, cap)については Stack に格納され、変数とバインドされ、所有権管理に利用される
    - 変数が破棄されれば[Drop trait](https://doc.rust-lang.org/1.30.0/book/first-edition/drop.html)の働きによりヒープメモリも破棄される

### Vector | Array | Slice とメモリの関係

- Vector
  - 型は`Vec<要素の型>`
- Array
  - 型は`[要素の型; 要素数]`
- Slice
  - 型は`&[要素の型]`、可変なら`&mut [要素の型]`

メモリ使用量は以下の通り

```rust
// プリミティブな型のバイト数 (あたりまえ)
assert_eq!(1, std::mem::size_of::<i8>());
assert_eq!(4, std::mem::size_of::<i32>());
assert_eq!(8, std::mem::size_of::<i64>());

// 前提として、64bitアーキテクチャだとメモリの単位は8byte
let pointer_size = std::mem::size_of::<usize>();
assert_eq!(pointer_size, 8);

// Vectorのメタデータ部分のメモリ占有量は常に8*3byte (ptr,len,cap)
// なおデータ部分のメモリ占有量は内包する要素の種類と数によって定まるが、ここでは割愛
assert_eq!(pointer_size * 3, std::mem::size_of::<Vec<u8>>());
assert_eq!(pointer_size * 3, std::mem::size_of::<Vec<i32>>());
assert_eq!(pointer_size * 3, std::mem::size_of::<Vec<String>>());

// Arrayのメモリ占有量は単に内容物の総計
// なおArrayにメタデータは存在しない
// TupleやStructも考え方はほぼ同じ。AlignmentやPaddingの話があるのできっちり合計値とはならない場合もあるが。
assert_eq!(1 * 10, std::mem::size_of::<[i8; 10]>());
assert_eq!(4 * 10, std::mem::size_of::<[i32; 10]>());
assert_eq!(pointer_size * 3 * 10, std::mem::size_of::<[Vec<i32>; 10]>());

// Sliceのメモリ占有量は常に8*2byte (ptr,len)
// Sliceの型は配列から作ろうがVecから作ろうが常に`&[T]`になる点に留意せよ
assert_eq!(pointer_size * 2, std::mem::size_of::<&[i8]>());
assert_eq!(pointer_size * 2, std::mem::size_of::<&[i32]>());
assert_eq!(pointer_size * 2, std::mem::size_of::<&str>());
assert_eq!(pointer_size * 2, std::mem::size_of::<&[String]>());
```

## 所有権

- Rust の値は必ず 1 つの「所有者」と呼ばれる変数と対応している
- 所有者がスコープから外れたら、値は破棄される。
- なぜ所有権が必要なのか？
  - ヒープメモリを効率的に管理するため
  - メモリの二重開放を防ぐため
  - Garbage collection を不要にするため

### コピーかムーブか、それが問題だ

- Copy Trait があるものは所有権が移転しない
  - 対象
    - 不変参照 (`&T`)
    - プリミティブな値
    - (Copy Trait を持つ型のみを含む) Tuple
    - (Copy Trait を持つ型の) Array
    - (Copy Trait が明示的に実装された) Struct
- Copy Trait がないものは所有権が移転する
  - 対象
    - 可変参照 (`&mut T`)
    - Vec, Box, String
    - (Copy Trait を持たない型を含む) Tuple
    - (Copy Trait を持たない型の) Array
    - (デフォルトの) Struct

### 参照と借用

関数を呼ぶ際の引数として、実体の代わりに(可変|不変)参照を与えることで所有権の移転を防ぐことを**借用**と呼ぶ

```rust
fn main() {
    let greeting = "hello".to_string();
    let length = count_string(&greeting);
    println!("{}の長さは{}です", greeting, length);
}

fn count_string(string_to_count: &str) -> usize {
  // ここで新たに生まれた`string_to_count`に、`&str`がバインドされる

  return string_to_count.len();

  // `string_to_count`はここで破棄されるが、
  // しょせん参照にすぎないのでもとの値に影響はない。
}
```

- 参照先の変数が所有権を失った場合、その参照はもはや使えずエラーになる
- 可変参照の制約
  - 不変参照 (`&`) と可変参照 (`&mut`) は同時に存在することができない
  - 可変参照 (`&mut`) は同時に 1 つしか存在することができない

## Slice

Slice とは、文字列リテラル `&str`、文字列 `String`、配列 `[T]` またはベクタ `Vec<T>` の一部分に対する参照で、以下の 2 種類がある。

- String Slice / 型は `&str`
- Array Slice / 型は `&[T]`

```rust
// String Slice
let my_string: String = "hello world".to_string();
let my_string_slice: &str = &my_string[1..5]; // -> 'ello'

// Array Slice
let numbers = [1, 2, 3, 4, 5];
let numbers_slice: &[i32] = &numbers[1..3]; // -> [2, 3]
```

## Struct / 構造体

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

TS でおなじみの省略記法も使える

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

- メソッド / Methods
- 関連関数 / Associated functions

```rust
struct Rectangle {
  width: u32,
  height: u32,
}

impl Rectangle {
  // メソッド(selfをとる)
  fn can_hold(&self, other: &Rectangle) -> bool {
    self.width > other.width && self.height > other.height
  }

  // 関連関数(selfを取らない)
  fn new() -> Rectangle {
    Rectangle {
      width: 10,
      height: 10,
    }
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

## Enum

- 列挙した値を列挙子 （Variant）とよぶ
- 構造体はフィールドの集合に対して AND の関係であり、列挙型は OR の関係である
- 列挙子ごとに型と値を持つことができる

```rust
// 定義
enum IpAddrKind {
    V4,
    V6,
}

// 代入
let maybe_ip_v4 = IpAddrKind::V4;

// 活用例
match maybe_ip_v4 {
    IpAddrKind::V4 => println!("v4です"),
    IpAddrKind::V6 => println!("v6です"),
}
```

値を持たせたり、メソッドを実装することができる。

```rust
enum SampleEnum {
    Quit,
    Position { x: i32, y: i32 },
    Message(String),
    Color(i32, i32, i32),
}

impl SampleEnum {
    fn output_message(self: &Self) -> String {
        match self {
            SampleEnum::Message(str) => "Message is: ".to_string() + str,
            _ => "other".to_string(),
        }
    }
}

let s = SampleEnum::Message("hello!".to_string());

println!("{}", s.output_message()) // -> `Message is hello!`
```

### Option 型

- Null になりうる値は Option 型として使う必要がある。
- 値を取り出すにはパターンマッチングか unwrap メソッドなどを使う
- Option, Some 及び None は接頭子なしで使用できる。

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
```

### Result 型

詳細後述

## match

基本形

```rust
enum Coin {
  Penny,
  Nickel,
  Dime,
  Quarter(String),
}

fn value_in_cents(coin: Coin) -> u32 {
  match coin {
    Coin::Penny => 1,
    Coin::Nickel => 5,
    Coin::Dime => 10,
    Coin::Quarter(state) => { // 値を持つEnumの場合はこのように取り出せる
      println!("{}", state);
      25
    }
  }
}
```

Option との組み合わせ

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}

let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);
```

### if let

`match`で特定のケースだけ取り扱いたい場合は、`if let`を使うことも検討すると良い。

```rust
let mut count = 0;
match coin {
    Coin::Quarter(state) => println!("State quarter from {:?}!", state),
    _ => (), // 何もしない
}

// これは下記のように書ける

let mut count = 0;
if let Coin::Quarter(state) = coin {
    println!("State quarter from {:?}!", state);
}
```

## エラー

rust には 2 種類のエラーがある。他の言語ではこれらは区別されないことが多い。

- recoverable なエラー
  - `Result<T, E>`型
  - 例）ファイルが見つからなかった場合
- unrecoverable なエラー
  - `panic!`マクロ
  - 例）Array の範囲外にアクセスした場合

### panic!

panic の発生時に Backtrace を取得するには、下記のように実行する。

```sh
RUST_BACKTRACE=1 cargo run
RUST_BACKTRACE=ful cargo run # かなり詳細に見たいとき
```

### Result

- プログラムを止めるまでもないエラーの場合、`Result`型が使われる。
- `Result`, `Ok`, `Err`は接頭子をつけずに使える。

```rust
enum Result<T, E> {
  Ok(T),
  Err(E),
}
```

手動で Result の中身を取り出す方法

```rust
use std::fs::File;
use std::io::Error;

// シャドーイングしながら中身を取り出す。
// なお型注釈はなくてもいい。
let f: Result<File, Error> = File::open("hello.txt");
let f = match f {
  Ok(file) => file,
  Err(error) => panic!("{:?}", error),
};
```

自動で Result の中身を取り出す方法 (前述の省略記法)

```rust
// expect は unwrap とほぼ同じだが、わかりやすいメッセージを表示することができる点で異なる
let f = File::open("hello.txt").unwrap();
let f = File::open("hello.txt").expect("Failed to open hello.txt");
```

より複雑な場合分けにはマッチガードを使う

```rust
// 存在すればそのファイルを、存在しない場合は作成したファイルを返す例
let f = File::open("hello.txt");
let f = match f {
    Ok(existingFile) => existingFile,
    // `ref`は所有権を奪わないためのおまじない
    Err(ref error) if error.kind() == ErrorKind::NotFound => match File::create("hello.txt") {
        Ok(newFile) => newFile,
        Err(e) => {
            panic!("Tried to create file but there was a problem: {:?}", e)
        }
    },
    Err(error) => {
        panic!("There was a problem opening the file: {:?}", error)
    }
};
```

エラーの処理を関数の呼び出し元にまかせるには、関数の返り値の型を Result にする。これを**エラーの委譲**という。

```rust
fn open_file() -> Result<File, Error> {
    match File::open("hello.txt") {
        Ok(file) => return Ok(file),
        Err(e) => return Err(e),
    };
}
```

エラーの委譲は`?`演算子を使って簡潔に記載できる様になっている。

```rust
fn open_file() -> Result<File, Error> {
    let f = File::open("hello.txt")?;
    Ok(f)
}
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

## Collections

- 予め用意されている便利なデータ構造のこと
- 複数の値を保持できるのが特徴
- Array や Tuple と異なり、ヒープメモリに保持されるため、コンパイル時にサイズを確定させなくてもいい

### Vector

- 単一型である
- 複数の値を保持できる
- 可変長である
- `Vec<T>`

```rust
// 初期値がない場合
let v: Vec<i32> = Vec::new();

// 初期値がある場合（マクロを使って初期化できる）
let v = vec![1, 2, 3];
```

値の追加

```rust
let mut v = Vec::new();

v.push(5);
v.push(6);
v.push(7);
v.push(8);
```

値の取得には２種類の方法がある。いずれも参照を取得する。

```rust
// 結果を&Tとして受け取る
// 存在しなければパニックになる
let third = &v[2];

// 結果をOption<&T>として受け取る
// 存在しなければNoneを返し、存在すればSome(&T)を返す。
let third = v.get(2);
```

反復処理

```rust
// 参照のみ
let v = vec![1,2,3];
for i in &v {
  println!("{}", i);
}

// 変更あり
let mut v = vec![1,2,3];
for i in &mut v {
  // Dereference operatorを使う
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

String とは？

- String literal(`str`)
  - rust で唯一の組み込みの文字列型
  - string slice(`&str`)として使用される。なぜなら、文字列自体はバイナリに組み込まれる完全に変更不可能なものであり、String literal はそこへの参照としてしか存在できないから。
- String type(`String`)
  - ライブラリにより提供される
  - 拡張、変更、所有が可能

rust の世界で'String'と言った場合、String type 又は String slice を指すことが多い。どちらも UTF-8。

String の作り方

```rust
let s = "aaa".to_string();
let s = String::from("aaa");
```

末尾に文字列を追加する。なお、`push_str()`は参照(string literal)を引数として取るので、所有権の移転は発生しない。

```rust
let mut s = String::from("foo");
s.push_str("bar");
```

文字列の結合(+を使う方法)

- `s1`の所有権は s に移る。再利用されるということ。少し効率的。
- `+`に与えることができるのは`&str`型。なお、`&String`は自動的に変換される。deref coercion という。

```rust
let s1 = String::from("tic");
let s2 = String::from("tac");
let s3 = String::from("toe");

let s = s1 + "-" + &s2 + "-" + &s3;
```

文字列の結合(`format!`を使う方法)

- この場合は所有権の移転は一切発生しない。

```rust
let s = format!("{}-{}-{}", s1, s2, s3);
```

UTF−8 の話

- rust の内部では文字列は byte(`vec<u8>`)でとして保持されている

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

どうしても必要ならインデックスを使うことも可能ではあるが、あまりいいアイデアではない。なお、中途半端な位置で切るとパニックになるので要注意。

```rust
let s1 = "こんちわ".to_string();
let s = &s1[0..3]; // sは&strになる("こ")
```

繰り返し

```rust
// Unicodeスカラ値として取り出して繰り返す
for c in "नमस्ते".chars() {}

// byteとして取り出して繰り返す
for b in "नमस्ते".bytes() {}

// graphene clustersで取り出して繰り返すには外部ライブラリが必要
```

### Hash Map

作成

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);
```

複数の vector を zip して作成することもできる

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

値の取得(Option 型が得られる)

```rust
let score = scores.get("Blue");
```

イテレーション

```rust
for (key, value) in &scores {}
```

値の更新

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

## Packages, Crates, and Modules

以下が分かりやすい。以降、このドキュメントに記載がない事柄だけを記載した。
https://zenn.dev/mebiusbox/books/22d4c1ed9b0003/viewer/c12c17

### Crates

Crate とは Rust プログラムの基本的なコンパイル単位である。実行可能なバイナリを作る Binary Crate と 再利用可能なライブラリを作る Library Crate の 2 種類がある。

Crate root とは、コンパイラがコンパイルを開始する起点となる Crate のことである。

実行可能なバイナリを生成したい場合は、Binary Crate として`src/main.rs` を作成する。これが Crate Root となる。複数の Binary Crate を作成したい場合は`src/bin/**.rs`を作成する。Binary Crate の数に制限はない。

再利用可能なライブラリを作成したい場合は、Library Crate として`src/lib.rs` を作成する。これが Crate Root となる。
Library Crate は 1 つだけしか作れない。

### Packages

Package は一つ以上の crate で構成され、なんらかのまとまった機能を提供する。`cargo.toml`を含み、ここには crate のビルド方法が書かれている。

### Modules

#### Struct | Enum の公開範囲

モジュールの中にある struct の要素はデフォルトで非公開。一方、enum の要素はデフォルトで公開。

#### モジュールの利用 (use)

下記のようにすると、他のモジュールを利用できる。

```rust
use crate::M1::M2;

// - 絶対パスでも相対パスでもOK
// - 以降、`M2::***`のように使える
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

```rust
// TODO: traitってなに？？ Rng.***ではないのか？
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
