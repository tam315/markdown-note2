# Effective TypeScript

## 1. TS と JS の関係を知る

- TS は JS のスーパーセット。JS のコードは TS のコードとして使える。
- TS は静的型付けにより、ランタイムエラーを事前に検出することを目的としている。
- 型チェックをパスしてもランタイムエラーは起きうる
- 引数の数が違うなどの明らかにおかしい構文は、JS ではチェックされないけど TS ではチェックされるものがある
- 型注釈は、開発者の意図を明示し、コンパイラが正解と不正解を見分けやすくするために使うもの

## 2. TypeScript のオプションを知る

- TS はオプション設定で劇的に動作が変わる
- JS からの移行プロジェクトを除き、`noImplicitAny`は必ずオン
- `strictNullChecks`も`undefined is not an object`のエラーをなくすために大事
- `strict`はそれら厳しめの設定の盛り合わせであり、オンを推奨
- `strict`よりも厳格な`noUncheckedIndexedAccess`のようなオプションもあるので適宜選択する

## 3. コード生成と型は独立していることを知る

- インターフェース、型、型注釈はトランスパイル時に全て削除される。
  - このためランタイム時に`instanceof SomeType`みないなことはできない。ランタイム時の判定には「タグ付きユニオン」などを使え。
  - また、型がランタイムのパフォーマンスに影響を与えることはない。ビルドタイムには影響を与えるけどね。
- class のように型と値を両方生成するものがある。

```ts
class Foo {}
class Bar {}
// 型として利用
type FooOrBar = Foo | Bar
// 値として利用
if (a instanceof Foo) {
}
```

- 型エラーはあってもトランスパイルはできる。
  - 少々型エラーがあっても動かせた方が開発時には便利だからそうなっている
  - `noEmitOnError`を使うと、型エラーがあるときにトランスパイルしないようにもできる
- 型アサーション（`as Hoge`）しても実際の値は変わらない。キャストではない。
- ランタイムの値は型と相違しうる。だからこそ、unsound(不健全)な値(any、型アサーション、構造的部分型のミスユースで発生しうる)はなくすのが大事。
- 関数を型レベルでオーバーロード定義することはできるが、実装は一つしか書けない

## 4. 構造的部分型と仲良くなる

JS は Duck Typed であり、TS はそのモデリングとして構造的部分型を採用している。
余計なプロパティを持っている可能性があるということ。
TS の型システムは closed/sealed/precise ではなく、open である。

構造的部分型をうまく使うと、テスト時に全てをモックすることなく、必要最低限の部分だけをモックすることができたりする。

## 5. any を使わない

any はあらゆる厄災のもと。使うな。

- 全ての型チェックが無効化される
- 型安全性が失われる
- DX が悪化する
- リファクタリング時の事故を誘発する
- あなたの型設計を覆い隠す
- 型システムへの自信を喪失させる

## 6. エディタ上で型を使い倒す

- TypeScript Language Service はエディタと協調して動作する
- 型がどのように動作しているかを確認できる
- 変数名や名前の変更といった、TypeScript のリファクタリングツールと親しくなろう

## 7. 型は値の集合であると考える

型は、値の集合である。この集合のことを、その型の**ドメイン**と呼ぶ。

集合には有限集合(e.g. boolean, リテラル型)と無限集合(e.g. string, number)がある。

型は厳格な階層構造**ではなく**、ベン図のように交差集合を形成する。
サブセットではないものの共通する部分はある、という状態がありえる。

型のオペレーションは集合（ドメイン、ベン図）に対して行われる。
`A | B` はドメイン A とドメイン B の和集合である。
`A & B` はドメイン A とドメイン B の積集合である。

オブジェクトの場合、余計なプロパティがあったとしても型に属せる。
直感とは異なるかもしれないが、構造的部分型の考え方に基づいている。
そして前述の通り、型のオペレーションは(オブジェクトのプロパティではなく)集合に対して行われるため、
`オブジェクトA & オブジェクトB`は、オブジェクト A とオブジェクト B の両方のプロパティを全て持つオブジェクトを表す。

`extends`、`is assignable`、`is subtype of`は、すべて`is subset of`の言い換えである。
例えば`'a' extends string`は真である。
ある型のドメインが別の型のドメイン内包するとき、代入ができる。

型 B を型 A にアサインできません、ということは、
型 B のドメインが型 A のドメインのサブセットでないということを表す。
または型 B の**値**が型 A のドメインのメンバーでないことを表す。

- 最も小さな集合は never 型
  - 空の集合である
  - あらゆる型のベースとなるため、Bottom Type と呼ばれる
- 次に小さな集合はリテラル型
  - 一つの値だけを含む有限集合である
- number 型は全ての数値を表す無限集合
  - `42`は含まれるが、`"Hello"`は含まれない
- string 型は全ての文字列を表す無限集合
  - `42`は含まれないが、`"Hello"`は含まれる
- 最も大きな集合は unknown 型
  - あらゆる値を含む無限集合である
  - never の対極にあり、Top Type と呼ばれる
  - どんな値でも代入できる

ちなみに any は unknown と似ているが、any はどんな型にでも代入できるという点で異なる。
型安全性を無視できる特殊型であり、集合論の枠にはまらない「抜け穴」のような存在である。

## 8. そのシンボルが型空間にあるのか値空間にあるのかを知る

TypScript のシンボルは、型空間に存在するものと値空間に存在するものがある。

あらゆる値は型を持つが、これは型空間でのみアクセス可能である。
type や interface は全て消去され、値空間ではアクセス不可能である。
TypeScript Playground にぶっ込んで生成コードを見るとわかりやすい。

class や enum など、型と値を両方生成する要素もある。

`typeof`や`this`は、型空間と値空間で別の意味を持つ。

## 9. 型アサーションより型注釈を使う

型アサーションではなく、型注釈を使え。

関数の返値の型を注釈すると、安全なうえに結果に型が付いて便利。
特にマップするときとかね。

```ts
type Person = { name: string }
const people = ['Alice', 'Bob', 'Charlie'].map((name): Person => ({ name }))
```

型アサーションや non null assertion を使っていいのは、
DOM 操作時など、TS よりも人間がコンテキストを知っているという特殊な状況だけ。
このときは、なぜアサーションの利用が正当化されるのか、コメントをつけておくとよい。

型アサーションをキャストと呼ぶな。他の言語と違って、値は変わらないから。

`as const`は型アサーションじゃなくて、`const context`であり、安全なものである。
値の型を「最も狭い型 + すべて readonly」にするおまじない。

## 10. Object Wrapper Types を使わない

`String`,`Number`,`Boolean`,`Synbol`,`BigInt`は Object Wrapper Types と呼ばれる。
`new String(hoge)`のようにすると直接扱うこともできるが、使うな。

もともと、TS ではプリミティブな値はメソッドを持たない。
`"Hello".toUpperCase()`は、`"Hello"`が`String`型という
Object Wrapper Types に一時的に変換されることで利用可能になっている。

なお、new しない`String(hoge)`などは単にプリミティブ型にキャストするだけなので使ってもよい。

## 11. 過剰プロパティチェックと型チェックを区別する

厳密な Structural Typing だと、その仕組み上、タイポや凡ミスがスルーされがちで不便である。
このため、過剰プロパティチェックという仕組みが用意されている。

これは型チェックとは違う仕組みなので注意すること。
（TypeScript は Closed な型システムではないことを思い出して）

オブジェクトリテラルを使って、型がわかっている変数に代入したときや、関数の引数に与えたときに発動する。
中間変数を使うと、過剰プロパティチェックは発動しない。

```ts
type Person = { name: string; gender?: string }

// オブジェクトリテラルで書くとエラーになる
const person: Person = { name: 'Alice', age: 42 }

// 中間変数を使うとエラーにならない
const intermidiate = { name: 'Alice', age: 42 }
const person2: Person = intermidiate
```

オプショナルなプロパティしか持たない型を Weak type と呼ぶ。この型への代入時には、
（過剰プロパティチェックとは別に）少なくとも一つの一致するプロパティがあるかチェックが行われる。

## 12. なるべく関数自体に型注釈をつける

Statement ではなく Expression で関数を書き、型注釈をつける。
そうすれば、引数と返り値の型を個別に書かなくて済む。

同じシグネチャの関数を複数書くときは、関数自体の型を定義して使いまわす。
もしくはすでに定義されている型を使う(`MouseEventHandeler`とかね)。

ライブラリを作るときは、よく使うコールバックの型をエクスポートしておくと親切だ。

既存関数の型を使いたいときは`typeof fn`を使う。
さらに戻り値の値を上書きしたいなら`Parameters`と rest parameter を使う。

```ts
const myFetch = (...args: Parameters<typeof fetch>): Promise<number> => {}
```

## 13. type と interface の違いを知る

- interface
  - merging が使える
  - 常に名前で表示されわかりやすい
- type
  - union が使える
  - 条件型が使える
  - inlining されると型名が消える

どっちを使ってもいいが、ルールが未決定のプロジェクトであれば、
なるべく interface を使うのがおすすめとのこと。

(訳注: interface を使うメリットを感じないので、シンプルに type に統一するのがいいと思う)

ちなみに型の頭に I や T などをつけるのはバッドプラクティスである。

## 14. readonly を使う

JS では、プリミティブな値は元から immutable だが、オブジェクトや配列は mutable である。

関数が値を変更しないなら、配列なら`readonly T[]`、オブジェクトなら`Readonly<T>`で受けとろう。
そうすれば、うっかり変更してしまうことを防げる。
const は再代入を防ぎ、readonly は変更を防ぐという点で異なる。

readonly は shallow に適用される点に注意する。
Deep に適用したいなら自作せずにライブラリを使え。
また、メソッドプロパティを介した変更は依然として可能である点にも注意する。

## 15. 型オペレーションとジェネリック型を使って繰り返しを減らす

DRY 原則は型の世界でも適用される。

型に名前をつけて(型エイリアス)繰り返しを減らそう。
interface で extends したり、型を Union したりして、繰り返しを避けよう。

型を別の型にマップ(変換、写像)する公式の方法を知ろう。
`keyof`, `typeof`, indexing, mapped types(`Record`) などがある。

`typeof`は値の世界と型の世界の両方に存在するので注意すること。

mapped types(`Record`) は`[A in B]`のような書き方をする。
配列のループ処理を同じような動作をする。
特に`A in keyof B`の様に書いたときは homomorphic にマップされ、
readonly や optional といった情報がそのまま引き継がれる。

```ts
// typeof
const config = { host: '', port: 0 }
type Config = typeof config // { host: string; port: number; }

// keyof
type Keys = keyof Config // 'host' | 'port'

// indexing
type Host = Config['host'] // string

// mapped types
type ReadonlyCfg = {
  readonly [K in keyof Config]: Config[K] // { readonly host: string; readonly port: number; }
}
```

ジェネリックとは「汎用的な」という意味。

ジェネリックスとは、「型を変数のように扱い、あとから具体的な型を渡せる仕組み」のこと。

ジェネリック型はジェネリックスを使って定義された型のこと。つまり、型引数を持つ型のこと。

公式の`Pick`, `Partial`, `Record`, `ReturnType`などを知っておこう。

以下はオブジェクトのジェネリック型の例。

```ts
type Box<T> = { value: T } // ジェネリック型の定義
type StringBox = Box<string> // ジェネリック型の利用
```

以下は関数のジェネリック型の例。

```ts
type Barker<Kind extends 'cat' | 'dog'> = (kind: Kind) => string // ジェネリック型の定義
type CatBarker = Barker<'cat'> // ジェネリック型の利用
const catBarker: CatBarker = kind => {
  return `Meow! I am a ${kind}`
}
catBarker('cat') // ok
// catBarker('dog') // error: kindは'cat'でなければならない
// catBarker<'cat'>('cat') // error: catBarkerはジェネリック**関数**ではない
```

以下は関数にマップされるジェネリック型ではなく、**ジェネリック関数**であり別物なので注意。
ジェネリック型では型エイリアスに型引数を渡すのに対し、
ジェネリック関数では実際の関数に型引数を渡す。

```ts
type Barker = <Kind extends 'cat' | 'dog'>(kind: Kind) => string
// type CatBarker = Barker<'cat'> // error: ジェネリック型ではないため
const barker: Barker = kind => {
  switch (kind) {
    case 'cat':
      return 'meow'
    case 'dog':
      return 'woof'
  }
}
barker('cat') // ok: ジェネリック関数 + 引数の型を推論
barker('dog') // ok: ジェネリック関数 + 引数の型を推論
barker<'cat'>('cat') // ok: ジェネリック関数 + 引数の型を明示
// barker<'cat'>('dog') // error: 引数は'cat'でなければならない
```

DRY 原則にこだわりすぎないこと。
間違った抽象化よりも繰り返しの方がマシ。

## 16. Index Signature は避けてもっと正確な型を使う

`{[key: string]: string}`のような書き方をするのが Index Signature である。

Index Signature は、どんな値がやってくるか不明な動的データに限って使うもの。
any のような悪い効果をもたらすので、なるべく避けるべき。

代わりに、intereface を定義せよ。
もしくは`Record<Union, V>` / `Map<Union, V>`や、
最悪でも`{[key: Union]: V}`を使え。

## 17. Numeric な Index Signature は使わない

JS では、あらゆるオブジェクトのキー名は string or symbol である。

配列も例外ではない。
TypeScript で配列の要素取り出しに number を使える様に見えるのは、
バグを見つけやすくするための架空の仕組みに過ぎず、
あくまで見かけ上のフィクションである。

```ts
const arr = ['a', 'b', 'c']
/**
 * 配列はこんなふうに管理されている
 * { '0': 'a', '1': 'b', '2': 'c', length: 3 }
 */
arr[1] // 'b' <= 数値でキーを指定できるようにみえるが
Object.keys(arr) // ['0', '1', '2', 'length'] <= 実はキーは文字列
```

自前オブジェクトに numeric キーを使うと、可読性の低下、型安全性の損失、予期せぬバグの原因になるなど、
様々な厄災が起きるのでやめよう。

数値をキー名にしたくなったら、配列、タプル、`ArrayLike`(Map を含む)、`Iterable`などで代用しよう。

## 18. 推論できるときは型注釈をつけない

型推論できるものに型注釈を書くのは意味がなく、手間や事故が増えるだけ。

オブジェクトリテラルには型注釈をつけよう。
過剰プロパティチェックが有効になり、エラーを発生場所により近いところで発見できる。

関数の引数には型注釈をつけよう。ただし関数内部のローカル変数には不要。

関数の返り値には基本的に型注釈はつけるな。
ただし、return が複数ある場合や、パブリックに使われる関数である場合、
名前付きの型で返したい場合などは、適宜付けよう。
(訳注: 私は常につける派)

## 19. 違う値には違う型を使う

変数の値が変わることはあっても、型が変わることはほぼない。
人も機械も混乱するので、異なる型を持つ値を同じ変数に再代入するのはやめよう。
別の変数として定義すべし。

## 20. 型推論がどう機能するか知る

TypeScript はコンテキスト、柔軟性と特異性のバランスを見ながら型を推論している。

- Widening
  - リテラル型 → 基本型
  - 推論を「ゆるく」して再代入を許容する
  - 止めたい場合は`as const`、`satisfies`、型注釈、ヘルパー関数などを使う

```ts
let msg = 'hello' // 文字列リテラルから文字列型へ
msg = 'world' // OK
```

- Narrowing
  - Union 型 → 部分型
  - 実行時情報で型を「厳しく」して安全に扱う
  - (詳細後述)

satisfies と型注釈は似ている。どちらもプロパティの過不足チェックを行う。
しかし、satisfies は推論結果を尊重してより狭い型を選択するのに対し、
型注釈のほうは推論せずに強制的に型を上書きするという点で異なる。

## 21. オブジェクトはいっぺんに作る

細々とピースごとにつくるんじゃなくていっぺんに作るほうが、タイプチェッカーと仲良くなれる。

Object Spread Syntax `...` を使うと型安全にオブジェクトを組み立てられる。
このとき、どういう型に推論されるか知っておこう。
なお`&&`を使った記法は`false`が入った時に推論結果が`any`になって死ぬので、
ちゃんと三項演算子で書くこと。

```ts
const obj = {
  ...(flag ? { a: 1 } : {}),
}
// const obj: {
//   a?: number | undefined;
// }

// &&で書くのは危険
const maybeNever = { ...(flag && { a: 1 }) }
```

## 22. Type Narrowing を理解する

TypeScript ではコードがどの場所にあるかによって、値の型が変わりうる。
これは他の言語にはない TS の特徴である。
Type narrowing するには以下のようなやり方がある。

- Null checking
- `instanceof`
- Property checking
- Built-in functions (e.g. `Array.isArray()`)
- `typeof`
- Tagged union (a.k.a Discriminated union)
- User defined type guard

なお、コールバック関数はいつの時点で実行されるかわからないため、
その外側で Narrowing を行ったとしても無効であることに注意する。

## 23. エイリアスを作ったらそれを使い続けろ

エイリアスに対して行った Narrowing は元のオブジェクトに適用はされないことがある（ただし手元ではこの挙動は確認できず）。
エイリアスを作ったらそれを使い続けろ。

```ts
type Person = { name: string | null }
const person = { name: 'jack' }
const personName = person.name // これがエイリアス

if (personName) {
  personName // string
  person.name // string | null
}
```

なお、オブジェクトを関数に渡すと、その値が変更されるかもしれない点に注意せよ。
プロパティは信用せずに、ローカル変数のみを信頼すること。
もしくは、必要に応じて関数の引数を readonly にするとよい。

```ts
if (place.name) {
  place.name // string
  someFunc(place)
  place.name // string | null に変わってるかも！
}
```

## 24. 型推論でコンテキストがどう使われるか理解する

コンテキストが失われて型エラーになることがある。
対処法は以下の通り。

```ts
type Language = 'JavaScript' | 'TypeScript'
function setLanguage(language: Language) {}

let language = 'JavaScript' // string
setLanguage(language) // 🚨 error: string is not assignable to Language

// ✅ 1. Use inline style
setLanguage('JavaScript')

// ✅ 2. Use const assertion (定義を間違えると定義時じゃなく使用時にエラーになるのでやっかい。注意せよ。)
const langConst = 'JavaScript' as const
setLanguage(langConst)

// ✅ 3. Use Type annotation
let langTyped: Language = 'JavaScript'
setLanguage(langTyped)

// ✅ 4. Use satisfies operator
const langSatisfied = 'JavaScript' satisfies Language
setLanguage(langSatisfied)
```

## 25. 進化する型(Evolving types)を理解する

最初は any だけど文脈によって進化していく型もあるらしい。
手元では動作が確認できずエラーになった。
これは使わずに明示的に型を指定した方が良さそう。

```ts
const arr = [] // any[]
arr.push('a') // string[]
arr.push(1) // (string | number)[]
```

## 26. 関数型構文やサードパーティライブラリを使って型の流れを改善する

以下を活用することで、型の流れを改善し、可読性を高め、明示的な型注釈の必要性を減らすことができる。

- `Array.protorype.map()`
- `Array.protorype.flat()`
- `for-of`ループ
- `Object.fromEntries()`
- `Object.fromValues()`
- 他多数

`zipObject`のような複雑なものは、lodash 等のライブラリ活用も検討すべき。

## 27. 非同期関数を使って型の流れを改善する

読みやすいコードを不可解なエラーを減らすため、
コールバックよりプロミスを、生プロミスよりも async-await を使おう。

## 28. 型引数を省略するにはクラスやカリー化を使う

複数の型引数を持つジェネリック関数では、すべての型引数を推論するか、
明示的に指定するかの二択(all or nothing)になる。

```ts
const createAPI = <API, Path extends keyof API>(path: Path) => {}
// 利用時には2つの型引数を明示する必要がある。
// Pathだけを推論にして省略することは不可能である。
createAPI<SomeSpecialAPI, '/some/endpoint'>('/some/endpoint')
```

もし型引数の一部だけを省略したい場合、逆に言うと一部だけを事前に確定しておきたい場合は、
クラスやカリー化を活用し、型引数を与える場面を分割するとよい。

例えば以下のような事例で考えてみよう。

- API の種別ごとに、エンドポイントと返り値を定義した型がすでにある
- データフェッチのロジックはすべての API で完全に共通である
- どのエンドポイントを叩くかは実行時に動的に決めたいし、結果には型推論が効いてほしい

```ts
interface SeedAPI {
  '/seeds': Seed[]
  '/seed/apple': Seed
}
interface CarAPI {
  '/cars': Car[]
  '/car/1': Car
}

// ① APIという型引数はここで明示的に指定する
function createFetcher<API>() {
  // ② Pathという型引数はここで暗黙的に推論する
  return async <Path extends keyof API>(path: Path): Promise<API[Path]> => {
    /* ここは任意の実装にする */
  }
}

const seedFetcher = createFetcher<SeedAPI>()
const berry = await seedFetcher('/seed/apple') // Pathは推論され、berryの型はSeed型になる

const carFetcher = createFetcher<CarAPI>()
const car = await carFetcher('/car/1') // Pathは推論され、carの型はCar型になる
```

上記はカリー化の例だが、クラスを使ってもやることは同じである。

(個人的には利用したい具体的なシーンがあまり思い浮かばないが、カリー化がジェネリック関数の型引数の省略に使えるということは覚えておこう)

## 29. 常に「正しい状態」を表す型を使う

ありえない状態を表現できてしまう型を作ると、混乱と事故を招く。
ありえる状態しか表せない型を設計しよう。
たとえコードが長くなったり設計が辛くても、最後には君を助けてくれる。

## 30. 入力には寛容に、出力には厳格に

入力はオプショナルだったりユニオン型だったりしても OK。

出力は常に厳格に型を定義する。そうしないと利用者側で混乱する。

型が巨大であり入出力で型を再利用する動機がある場合は、Pick や Omit を活用するとよい。

イテレートしたいだけなら`T[]`じゃなくて`Iterable<T>`を使うとよい。

## 31. 型を見ればわかることをコメント等に書かない

型を見ればわかることをコメントや変数名に書くと、冗長になったり、情報の齟齬が発生しがちになったりするのでやめよう。

例外として、単位を書くのは OK (e.g. `const timeMs: number = 100`)

## 32. null や undefined を型エイリアスに含めない

`const User = { name: string } | null`のような書き方はやめよう。
どうしても避けられない場合は`Maybe<T>`のような型を定義して使うとよい。

## 33. Null を型の外側に追い出す

外側に追い出せば、以下の利点が得られる。

1. **型の複雑さを局所化**: null チェックが一箇所で済む
2. **推論の改善**: 一度 null チェックを通れば、以降はすべてのプロパティを安全に使える
3. **保守性**: 型定義がシンプルで理解しやすい

悪い例: Null が内側にある設計

```typescript
// 各プロパティにnullが混入
interface User {
  id: string | null
  name: string | null
  email: string | null
}

// 使う側が複雑になる
function displayUser(user: User) {
  if (user.id && user.name && user.email) {
    // 毎回すべてのプロパティをチェック
    console.log(`${user.name} (${user.email})`)
  }
}
```

良い例: Null を外側に追い出す

```typescript
// 型定義は純粋に
interface User {
  id: string
  name: string
  email: string
}

// nullの可能性は外側で管理
type MaybeUser = User | null

// 使う側がシンプルになる
function displayUser(user: MaybeUser) {
  if (user) {
    // 一度チェックすれば、内部は安全に使える
    console.log(`${user.name} (${user.email})`)
  }
}
```

## 34. インターフェースをユニオンにする（逆はだめ）

いわゆるタグ付きユニオン。

```ts
interface Layer {
  layout: FillLayout | LineLayout | PointLayout
  paint: FillPaint | LinePaint | PointPaint
}
// ではなく

type Layer =
  | { type: 'fill'; layout: FillLayout; paint: FillPaint }
  | { type: 'line'; layout: LineLayout; paint: LinePaint }
  | { type: 'point'; layout: PointLayout; paint: PointPaint }
// にしたほうがいい
```

## 35. String Type より詳細な型を使う

別名`Stringly typed`とも呼ばれる。
`any`と似たような厄災をもたらす。
文字列リテラルのユニオン型に置き換えるのが定石。

## 36. プリミティブ値に特別な意味を持たせない

`0`や`-1`や`""`などのプリミティブ値に特別な意味を持たせるのはやめよう。
せめて`null`や`undefined`を使うべき。
もっと言えば、タグ付きユニオンを使うのがベスト。

## 37. オプショナルなプロパティを避ける

オプショナルなプロパティは問題が多い。

- バグの温床になる
- デフォルト値に依存してうっかり事故る
- 組合せ爆発の原因になる

オプショナルなプロパティを追加したくなった時は、立ち止まれ。
どうにかして必須にできないか考える。

未正規化の型（ドラフト）と正規化済みの型（本番）を分けて定義するのも一つの手である。

また、非同期に取得するデータがある場合は、
取得前・取得中の中途半端な状態を型で表現するのではなく、
取得が完了した後のすべて揃った状態を型として表すのがよい。

## 38. 同じ型の引数を並べるな

`drawRect(25,50,75,100,2)`みたいな関数はやめよう。
単一のオブジェクトで渡すか、いくつかの固有の型を定義して渡すべき。

## 39. 型を統一せよ

例えば DB 由来の型とドメインの型が別々の型として定義されている場合(snake_case と camelCase の違いなどで)は、
一つの型に統合して、コードベース全体で同じ型を使った方がよい。

ただし、外部 API 由来の場合などはそうもいかないので、やむなく二重管理が発生することもある。

## 40. 不完全(Inprecise)な型でもシンプルならよしとする

型の精度を突き詰めて上げようとすると、型が複雑になりすぎ、その結果として**不正確(Inaccurate)**な型になりがち。
また、保守コストやデバッグコストも無限に上がっていく。

たとえ**不完全(Inprecise)**であっても、ある程度の精度で割り切る判断も大事。

## 41. 型はドメインの言葉で名付ける

info, data, Entity といった曖昧な名前は避ける。
ドメイン特有の専門用語を正しく使って名前をつけることで、意図を明確にする。

「それがなにであるか」で名前をつける。何を含むかや、コンピューターにどう処理されるか、で名前をつけるな。

似ている言葉を見つけたら、違いを説明できるか確認しよう。説明できないなら統一しよう。

## 42. 裏付けに乏しいデータから型を作らない

外部 API を使用する場合などは、公式またはコミュニティから提供されている型定義を利用しよう。
自分が見た範囲のデータやドキュメントだけをもとにして自作の型を作ると、エッジケースを見落とすなどの危険がある。

また、GraphQL のように型定義の自動生成ができる場合は積極的に活用しよう。

## 43. any は最小限のスコープで使う

そもそも any は使わないのがベスト。
特に any を返す関数は汚染を広げるので罪が重い。

やむを得ず使う場合は、最小限の範囲で`as any`を使ってキャストするなどし、スコープを狭くすること。

```ts
// よくない例 汚染が広がる
const pizza: any = getPizza()
toppingPizza(pizza)

// まだマシな例 汚染は最小限
const pizza = getPizza()
toppingPizza(pizza as any)
```

関数の返り値は明示しておくと良い。うっかり any を返す関数を作ってしまうのを防げるから。
特に`JSON.parse`は any を返すので要注意。

`@ts-ignore`よりも`@ts-expect-error`の方がいい。エラーがなくなった時に教えてくれるから。

## 44. 巣の any よりちょっとマシな any を使う

`any`より`any[]`や`Record<string, any>`の方がマシ。
もっというと`unknown`の利用は全く問題ない。

## 45. 非安全な型アサーションは関数内に隠す

例えば fetch して parse した値を`unknown`として返す関数があるとする。
こういうときは、中身のチェックや型アサーションを関数内部に入れ込んで隠蔽してしまうと良い。
そうすれば利用側は安全に使うことができる。

網羅的なユニットテストを書き、なぜアサーションが正当化されるかをコメントで書いておくと良い。

`K in B`をチェック済みなのに`B[K]`がエラーになるのは TS の限界。
こういう時は`(b as any)[k]`のようにするほかない。

## 46. any じゃなくて unknown を使う

unknown は安全な any である。未知な値やどうでもいい値に使う。

unknown は Type Narrowing(22 項)と組み合わせて使う。

- `{}`と`Object`は null と undefined 以外のすべての値
- `object`(o が小文字)はオブジェクト、配列、関数など、非プリミティブ値

これらが必要なケースはほぼないので、`unknown`を使うのが正解。

ジェネリック関数で返り値の型をパラメータで指定するのは、安全性の錯覚を生むことがあるので注意。

## 47. モンキーパッチは避けて型安全な方法を選ぶ

モンキーパッチは、既存のオブジェクトにプロパティを追加することを指す。
あまり褒められた方法ではないが、必要な時もある。

TS の世界でこれを行う方法はいくつかある。

一つ目は declare global を使う方法。
アプリ全体で window を拡張したい場合などに有効。

```ts
declare global {
  interface Window {
    // HTMLにベタ書きしてないかぎり、タイミングによっては undefined になりうるので注意。
    userId: number | undefined
  }
}
```

2 つめはカスタムな`Window`型を定義する方法。
一時的・局所的な monkey patch をしたい時に有効。
これをやったところで結局のところグローバルなので注意。

```ts
type MyWindow = typeof window & {
  myTemporaryValue: number
}
```

## 48. Soundness の罠に気を付ける

TypeScript における「soundness（健全性）」とは、静的型が実行時の値と常に一致していることを指す。
一致しないということはランタイムエラーが起きることを表す。

TypeScript は利便性・表現力・安全性のバランスを考え、あえて Soundness を犠牲にしている場面がある。
以下のような対策をとることで、Unsoundness（非健全性）を避けることができる。

- any のかわりに unknown を使う
- 型アサーションを最小限に抑え、代わりに Type Narrowing を使う
- `strict`や`noUncheckedIndexedAccess`を有効にする
- オブジェクトや配列には readonly をつけて意図しない変更を防止する
- 引数を Mutate しない
  - 呼び出し元での Soundness が失われるため
- オプショナルプロパティを避ける
  - Excessive Property Checking を回避する形での代入をした際に、意図しないプロパティが混入する恐れがあるため
  - `exactOptionalPropertyTypes`を有効にすればオプショナルプロパティの挙動自体は多少マシになるが、意図しないプロパティ代入自体を防ぐことはできない

具体例

```ts
// 1. すべてのプロパティを持つ完全なオブジェクト
const full: { name: string; isAdmin: boolean } = {
  name: 'Alice',
  isAdmin: true,
}

// 2. 一部のプロパティだけを持つオブジェクト型に代入（プロパティを減らす）
const partial: { name: string } = full

// 3. isAdmin を「あるかもしれない」オプショナルプロパティとして持つ型に代入
const maybeWrong: { name: string; isAdmin?: string } = partial

// 4. isAdmin にアクセスしてみると…？
const role = maybeWrong.isAdmin

// 型は string | undefined のはずが…実際の値は boolean (true)！
console.log(role) // => true ← 🤯
```

## 49. 型のカバレッジを確認する

自分では any を使っていなくても、サードパーティー由来で any が入り込むことがある。

`npx type-coverage --detail`すると型安全でない箇所を一覧できるので、定期的に確認すると良い。
設定は`package.json`に書ける。

```json
{
  "typeCoverage": {
    "ignoreFiles": [
      "dist/**",
      "**/*.integration-test.*",
      "some/special-file.ts"
    ]
  }
}
```

これを CI に組み込んで、any が増えないようにするのも良い。

## 50. ジェネリクスとは

- ジェネリクスは**型世界における関数**である
- extends を使って型パラメータのドメインを制限する。value-world で型を使って値を制限するのと同じように。
- スコープが広くなるほど、型パラメータの名前を具体的かつ適度な長さにするとよい
- 型パラメーターは TSDoc `@template`でドキュメント化する

```typescript
/**
 * 配列の最初の要素を取得する関数
 * @template T - 配列の要素の型
 * @param arr - 入力配列
 * @returns 最初の要素またはundefined
 */
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}
```

- 関数やクラスといった value-world の構造体に型引数を付与することもできる
  - Generic Function や Generic Class と呼ぶ
  - その関数・クラスに密接に関連したジェネリック型を定義していると言える

## 51. 不要な型パラメーターを避ける

関数やクラスに不要な型パラメータを追加しないこと。
インライン化したり解体したりすることでシンプルにできることがあるよ。

型パラメータが 1 回しか登場しないなら、黄色サイン。少なくとも 2 箇所に登場して関係性を表すべき。

特に宣言部分とリターン部分でしか使われていない"Return-only generics" は避ける。
これは any を返すのと同じ働きをする。

不要な型パラメーターは、多くの場合は unknown で書き換えられる。

## 52. オーバーロードよりも Conditional Type を使う

例えば、引数が number なら数値を返し、string なら文字列を返すという `double(x)`関数を作りたいとする。

このような場合、オーバーロードの仕組みを使うことができる。
オーバーロードとは、1 つの関数に対して複数の呼び出しパターン（シグネチャ）を型として宣言し、
そのあとに 実装（本体）は 1 つだけ書く仕組みのこと。
このとき、型は最初にマッチした 1 つだけが採用される。
（なお、アロー関数でオーバーロードする方法は調べたところなさそう）

しかし、実はオーバーロードを使うよりも、
Conditional Type を活用した単一の関数型を定義するほうがよい。

そうすることで、正確な返り値の型を簡潔に表現できるし、
T がユニオン型であったとしても適切に分配してくれる。

なお、Conditional Type をつかって型定義と実装を同時にやろうとすると、
うまく推論できない場合が多いので「single-overload」戦略が有効である。

これは、正確な型定義を独立して作成したうえで、実装側では簡単な型で行うもの。
ただし型と実装に差が出ないように注意は必要である。

```ts
// 正確な型定義
function double<T extends number | string>(
  x: T,
): T extends string ? string : number

// シンプルな実装
function double(x: string | number): string | number {
  return typeof x === 'string' ? x + x : x * 2
}
```

とはいえ、性質が全く違う場合などは素直に関数を分けた方がいいだろう。

## 53. Union 型と条件付き型の分配制御

条件付き型にユニオン型を与えると、デフォルトで分配される。

分配とは、条件付き型にユニオン型を渡した際に、
そのユニオンの各構成要素に対して個別に条件式が評価され、
その結果が再びユニオンとして合成されるという動作のことを指す。

たとえば、`(A | B) extends U ? X : Y` という型は、
`(A extends U ? X : Y) | (B extends U ? X : Y)` として評価される。

分配の挙動は、思わぬバグや意図しない型推論の原因になりがち。

```ts
type ToString<T> = T extends number ? string : boolean
type Result = ToString<number | Date> // string | boolean
```

分配を望まないときは、型を`[]` で包んで一つのタプル型にしてから判定するとよい。
そうすると分配されずに、単一のタプル型として扱われる。

```ts
type ToString<T> = [T] extends [number] ? string : boolean
type Result = ToString<number | Date> // boolean (`[number|Date]`は`[number]`をextendsしてないので)
```

なお、`boolean` を条件付き型に渡すと `true | false` のユニオンとして分配されるので注意。

```ts
type IfTrue<T> = T extends true ? 'yes' : never
type Step1 = IfTrue<boolean>
type Step2 = IfTrue<true> | IfTrue<false>
type Step3 = 'yes' | never
type Step4 = 'yes'
```

また、`never` を条件付き型に渡すと、条件付き型の実装によらず、結果は常に `never` になるので注意。

```ts
type Result = IfTrue<never> // 結果は常にnever、実装は関係ない
```

## 54. テンプレートリテラル型を活用する

テンプレートリテラル型を活用すると、string を構造化したサブセットを作れる。
これは文字列にルールを与えられることを意味し、
DSLs（domain-specific language、領域固有のミニ言語）を扱うときに非常に便利である。

具体的には、例えば`img#id` のような CSS セレクタから`img`タグだけを抽出したり、
`snake_case`から`camelCase`に変換したりするような場合に役立つ。

---

文字列の検証に使う例。

```ts
type Users = {
  // プロパティ名が必ず特定の文字列から始まっていること
  [K in `user_${string}`]: string
}
```

ジェネリクス・型推論と組み合わせて、型(HTMLTag)を別の型(Element の種類)に対応づけする例。

```ts
type HTMLTag = keyof HTMLElementTagNameMap // HTML タグ名のユニオン型
function querySelector<TagName extends HTMLTag>(
  // こう書くと引数から型推論したうえ文字列リテラル型として取り出せる
  // (こうすれば`img#id`でセレクトしてもちゃんとHTMLImageElementが得られる)
  selector: `${TagName}#${string}`,
): HTMLElementTagNameMap[TagName] | null
```

さらに条件付き型やマップ型と組み合わせることで、高度な型変換が可能になる。

```ts
// 条件付き型を使ってsnake_caseからcamelCaseに変換する。
// 条件付き型の比較対象部分で`infer`すると文字列リテラル型を取り出せる。
type ToCamel<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<ToCamel<Tail>>}`
  : S

// マップ型を使ってオブジェクトのキーを一括してcamelCaseに変換する
type ObjectToCamel<T extends object> = {
  [K in keyof T as ToCamel<K & string>]: T[K]
}
```

やりすぎに注意し、不正確な型を作らないようにしよう。
あくまで利用者の DevEx が無理なく向上する範囲に留めよう。

## 55. 型のテストを書く

型のテストは大事。

- Equality と Assignability は違う点に注意
  - 余計なプロパティがあっても代入はできるが、等しくはないよね
- `expect-type`(vitest に含まれる)を使うと良い
  - 様々な落とし穴があらかじめ塞がれている
  - Equality のチェックも簡単

## 56. 型がどのように表示されるかに気を配る

特にライブラリを作るときは気にしよう。
下記のようなリゾルバーを使うと、不思議なことに中身が展開される。
これを使って表示する方が中身が見やすくなる場合があるので適宜利用する。

```ts
type Resolve<T> = T extends Function ? T : {[K in keyof T: T[K]]}
```

## 57. Tail-Recursive なジェネリック型を使う

関数の最後の処理が自分自身の再帰呼び出しだった場合、
Tail Call Optimization (TCO) という最適化処理が実行され、
コールスタックを使い果たすことがなくなる。

型エイリアスの世界でも同様のことが言える。Accumulator を使うと良い。
例えば配列の長さを求める型エイリアスの例は以下のとおり。

```ts
// 通常の再帰 - すぐに制限に達する
type Length<T extends readonly unknown[]> =
  T extends readonly [unknown, ...infer Rest]
    ? 1 + Length<Rest>  // ここで加算をしているため、TCOが効かない
    : 0;

// Accumulatorを使った実装
type Length<
  T extends readonly unknown[],
  Acc extends readonly unknown[] = []  // Accumulatorとして配列を使用
> = T extends readonly [unknown, ...infer Rest]
  ? Length<Rest, [...Acc, unknown]>   // 再帰呼び出しが最後の処理
  : Acc['length'];                    // Accumulatorの長さが結果
```

## 58. 型が複雑な場合はコード生成も検討する

型プログラミングは強力だが常に最適な選択肢ではない。
複雑な型の作成が求められる場合は、コード生成を活用するほうが
より実用的で保守しやすい場合もある。

## 59. 網羅性チェックに never を活用する

case 文や if 文などで網羅性をチェックするために、以下のような util 関数を使うと良い。

```ts
export const assertNever = (_: never): never => {
  // もしランタイムで呼ばれたらすぐに気がつけるように一応エラーを投げておく
  throw new Error('This code should not be called')
}

// こんな感じで使う
const getNumber = (value:string):number => {
  case (value) {
    case 'a':
      return 123
    case 'b':
      return 456
    default:
      // valueがnever型以外だと型エラーになるので漏れに気がつける。
      // ちなみに関数の返り値であるneverをreturnしているが、
      // never型はどの型にも代入できるため、型エラーにはならない。へぇー。
      return assertNever(value)
  }
}
```

## 60. オブジェクトをイテレートする方法を知る

- 構造的部分型においては、オブジェクトには余分なプロパティが含まれている可能性が常にあることを忘れないこと
  - だからこそ、イテレートしたときにオブジェクトのキーは、文字列リテラルのユニオンではなく、`string`に解釈されるのだ
- キーと値をイテレートする場合は`Object.entries()`を使うと良い
- 必要に応じて Map の利用も検討する

## 61. 型とロジックを同期させるために Record を使う

「データ構造」と「それに対応する処理ロジック」の同期が必要なときには、
Record 型を活用すると良い。

たとえば、パフォーマンス向上のために、オブジェクトの特定のプロパティが更新された時にだけ
保存処理をしたい場合を考えてみよう。

こういうとき、愚直にやると fail-open / fail-closed のジレンマにハマりがちである。

- **Fail Open** - 不明・曖昧な場合に「処理を実行する」側に倒す
  - 安全だが、うっかり無駄な処理が生まれがち
- **Fail Closed** - 不明・曖昧な場合に「処理をしない」側に倒す
  - 効率的だが、必要な処理を落とすリスクあり

このジレンマを解消するには Record を活用して型とロジックの対応を定義する。
そうすると型だけを更新して、処理を更新し忘れるという人為的ミスを防ぐことができる。

```ts
// ユーザー設定のインターフェース
interface UserSettings {
  theme: 'light' | 'dark'
  language: string
  notifications: boolean
  // ここに将来何かのプロパティを追加するかもしれない
}

// ❌ 悪い例：手動でプロパティを列挙
function shouldSaveSettings(old: UserSettings, current: UserSettings): boolean {
  return (
    old.theme !== current.theme ||
    old.language !== current.language ||
    old.notifications !== current.notifications
    // もし新しいプロパティが追加されても気づかない。つまり、必要な更新がされない。fail-closed。
  )
}

// ✅ 良い例：Record型で保存が必要な設定を別途定義しておく
const SHOULD_SAVE: Record<keyof UserSettings, boolean> = {
  theme: true,
  language: true,
  notifications: false,
  // もし新しいプロパティが追加されても、ここでエラーが出るので確実に気がつける
}

function shouldSaveSettings(old: UserSettings, current: UserSettings): boolean {
  return Object.entries(SHOULD_SAVE).some(([key, shouldSave]) => {
    if (shouldSave) {
      return (
        old[key as keyof UserSettings] !== current[key as keyof UserSettings]
      )
    }
    return false
  })
}
```

## 62. 可変長引数を扱うために Rest と Tuple を使う

関数で引数を可変長にしたいときは、値の世界で Rest を使い、その型としてタプル型を割り当てることで、
シンプルに実現できる。

```ts
type Routes = {
  '/users': []
  '/users/:id': [id: string]
  '/search': [query: string, limit?: number]
}

function fetch<T extends keyof Routes>(path: T, ...args: Routes[T]) {
  console.log(`Fetching ${path}`, args)
}

// 使用例
fetch('/users') // OK - 引数なし
fetch('/users/:id', '123') // OK - 1つの引数
fetch('/search', 'typescript') // OK - 1つの必須引数
fetch('/search', 'typescript', 10) // OK - オプショナル引数付き
```

## 63. 排他的論理和の表現に never を使う

日常会話の or は排他的論理和だが、TypeScript の or は包含的論理和である。

排他的論理和を表現したい場合は、まずはタグ付きユニオンを使うのが一般である。

タグを使いたくない場合には、never を使う方法もある。

```ts
interface OnlyThingOne {
  shirtColor: string
  hairColor?: never
}

interface OnlyThingTwo {
  hairColor: string
  shirtColor?: never
}

type ExclusiveThing = OnlyThingOne | OnlyThingTwo
```

さらに、never を直接的に使うよりは、以下のような util 型を介して使うと良いだろう。

```ts
type XOR<T1, T2> =
  | (T1 & { [k in Exclude<keyof T2, keyof T1>]?: never })
  | (T2 & { [k in Exclude<keyof T1, keyof T2>]?: never })
```

## 64. Brand を使って Nominal Typing を実現する

- 構造的部分型：形で区別する。形が同じなら同じ型として扱う。
- 公称型：名前で区別する。名前が同じなら同じ型として扱う。

構造は同じだが意味的には違うものを区別したい場合には、公称型を使う必要がある。
このような場合はタグ付きユニオンを使うのが一般的だが、
これは少なからずランタイムオーバーヘッドを伴う。

純粋に型の世界で実現したい場合は、Brand を使うと良い。
Brand とは、型に対して追加の情報を付与することで、異なる型として扱う手法である。

```ts
// 文字列型にブランドを付与する
type AbsolutePath = string & { _brand: 'abs' }
function isAbsolutePath(path: string): path is AbsolutePath {
  return path.startsWith('/')
}

// 数値型にブランドを付与する
type Meters = number & { _brand: 'meters' }
function isMeters(value: number): value is Meters {} // 実装略

// 配列にブランドを付与する
type SortedList<T> = T[] & { _brand: 'sorted' }
function isSorted<T>(xs: T[]): xs is SortedList<T> {} // 実装略

// ブランドを偽装されるのを防ぐには、プロパティ名にsymbolを使うとよい
// こうするとbrandは公開されないので、ユーザーは必ず
// 提供されたカスタム型ガードなどを通過しなければならない
declare const brand: unique symbol
export type Meters = number & { [brand]: 'meters' }
```

## 65. `typescript`と`@types/*`は devDependencies に入れる

- dependencies: 実行時に必要なパッケージ（例：lodash）
- devDependencies: 開発・テスト時のみ必要なパッケージ（例：テストフレームワーク）
- peerDependencies: 実行時に必要だが、バージョン選択をユーザーに委ねたいパッケージ

`typescript`はシステムレベルでインストールせず、devDeps に入れることで、
開発者が必ず同じバージョンで開発できるようにする。

また、`@types/*`も同様に devDeps に入れることで、
イメージの容量を節約したり、効率的なアップグレード戦略を取ったりできる。

## 66. 型定義のバージョン管理には 3 つの要素が関係することを理解する

1. ライブラリのバージョン
2. ライブラリの型定義のバーション(`@types/*`)
3. TypeScript のバージョン

ライブラリとその型定義は、minor version が一致している必要がある。
patch version は一致していなくてもよい。

`@types/*`が TypeScript の新しいバージョンに依存することもある。
この場合、TypeScript のバージョンを上げるか、`@types/*`のバージョンを下げる必要がある。
`@types/react@ts4.9`みたいなタグはそういうときに使う。

型定義ファイルをライブラリにバンドルするのはデメリットもある。
たとえば型定義だけを柔軟に更新できないなど。

判断基準として、ライブラリが TS で書かれている場合はバンドルし、そうでなければ DefinitelyTyped にするのがよい。

## 67. API に現れる型はすべて公開する

引数や返り値の型など、パブリックな API に現れる型は、すべて公開することが望ましい。

## 68. API のコメントには TSDoc を使う

- パブリックな API の関数や型エイリアスなどには、TSDoc を使ってコメントを書くことが望ましい。
- `@param`,`@returns`, `@template`, `@deprecated`などのタグと、マークダウン記法を活用する。
- JSDoc における`{SomeType}`による型の明示は TypeScript では冗長なので避ける

## 69. `this`の型を明示する

JS ではほとんどの値は Lexically scoped、つまり「どこに書いてあるか」で値が決まる。
しかし、`this`だけは Dinamically scoped、つまり「どうやってそこにたどり着いたか」で値が決まる。

コールバック関数で this を使うのは避けるべきだが、
どうしても使う場合は、`this`の型を明示することが望ましい。

例：`listener: (this: HTMLElement, e: KeyboardEvent) => void`

(ちょっとよくわからんけど使うことはなさそうなのでヨシ)

## 70. 不要な型依存をなくすために最少限の型を複製する

推移的な型依存(あるライブラリの型が、第三のライブラリの型に依存すること)は様々な問題を引き起こすのでやめよう。

たとえば Web でも Node.js でも使えるライブラリを作る場合、
Node.js の型定義が推移的に依存先に含まれていると諸々の問題が起きる。

- Web の開発者「なんで`@types/node`が必要なの？Node.js はつかわないのに...」
- JS の開発者「なんで`@types/node`が必要なの？型はいらないのに...」
- 違うバージョンの`@types/node`を使っている開発者「バージョンコンフリしたんですけど...」

そんなときは、構造的部分型の性質を利用しよう。
具体的には、たとえば Node.js の`Buffer`を直接使うのではなく、
必要最少限のインターフェースを自前で再定義して使用する。
ただし、テストでは Node.js の`Buffer`をこれまでどおり使って行うこと。

これにより、`@types/node`への依存をなくしつつ、前述の問題を解消できる。

Go の格言「少量のコピーは少量の依存よりもまし」を思い出そう。

## 71. Module Argumentation を使って型を改善する

interface には declaration merging という、
型エイリアスにはない仕組みがあることを思い出そう（Section 13 を参照）。

これを使うことで問題のある型を改善することができる。
例えば、歴史的経緯により`JSON.parse`や`Response.json()`の返り値は`any`である。
これを改善するために、以下のように宣言をマージして型を改善できる。

```ts
// my-safe-response.d.ts
interface Body {
  json(): Promise<unknown>
}
```

こういう小さな改善を集積したライブラリが[`ts-reset`](https://github.com/mattpocock/ts-reset)なので使うと良い。

## 72. TypeScript の機能より JavaScript の機能を優先して使う

原則として、TS のコードから型の記載を削除すれば、JS のコードになる。
しかし以下はその例外である。JS 標準から外れた仕様とも言える。

- Enums
- クラスの Parameter Properties 記法
- Triple-slash imports (`namespace`)
- `experimentalDecorators`
- `protected`や`private`などのアクセス修飾子

TS と JS の役割をきちんと分離すべきであることや、将来の互換性も考慮すると、
これら非標準の機能を使うのは避けるべきである。

- 諸問題を抱える enum ではなく、文字列リテラルのユニオンを使う
- Parameter Properties 記法は使わず、明示的に書く（諸説あり）
- Triple-slash imports は使わず、JS 標準の import/export を使う
- `experimentalDecorators`オプションによるデコレータは古いので`false`にし、JS 標準のデコレーターを使う。そもそもデコレータは控えめに使え。
- `private`のかわりに、JS 標準の`#`を使う。`protected`はそもそも不要、使うな。

## 73. デバッグにソースマップを使う

トランスパイル後の JS ファイルではデバッグできないので、ソースマップを使おう。

`tsconfig.json`で`compilerOptions.sourceMap`を`true`にすると、
`tsc`した時に`.js`とあわせて`.js.map`ファイルが生成される。

Vitest など、何らかのバンドラーを使っている場合はこの設定は効かないので、
そのバンドラー固有の設定でソースマップ生成を有効にすること。

`NODE_OPTIONS='--inspect(-brk)=0.0.0.0'`にするか、
`node ----inspect(-brk)=0.0.0.0 some-file.js`のように起動することで、
デバッガー用のエンドポイントがデフォルトで`9229`番ポートで開かれる。
そこに`chrome://inspect`や VSCode/JetBrains のデバッガーなどで接続してデバッグする。

`brk`つけると全コードの中の一番最初の行にあらかじめブレークポイントが設定されるので、
プロセスの起動直後に落ち着いてブレークポイントを設定したい場合に使う。

## 74. ランタイムで型を使う方法を知る

型と値を同期させるためには、
single source of truth（真実の単一のソース）を保たなくてはならない。

例えばリクエストをバリデーションするときなどが典型だろう。
愚直にやると、型と値は別々の場所に書かれて関連性がわからなくなり、同期も手動になる。

```ts
// 型定義
type User = {
  id: string
  name: string
  email: string
}
// バリデーション
function validateUser(user: User) {
  if (typeof user.id !== 'string') {
    throw new Error('Invalid id')
  }
  if (typeof user.name !== 'string') {
    throw new Error('Invalid name')
  }
  if (typeof user.email !== 'string') {
    throw new Error('Invalid email')
  }
}
```

1 つめの解決法として、GraphQL や OpenAPI などの**スキーマ定義言語**を使う手がある。
これを使えば、スキーマから型もランタイムコードも同時に生成できる。
デメリットとしては、ビルドプロセスが複雑になることが挙げられる。

2 つめの解決法として、**ランタイムで値を作り、それを型にする**方法がある。
代表的なのは Zod などを使う方法である。
ビルドプロセスはシンプルなまま、TS だけだと不可能な高度なバリデーションが可能になる。
デメリットとしては、学習コストの増加が挙げられる。
また、Zod でサードパーティーの型定義を参照しようとすると、
それらも Zod で定義しなおさないないと使えないという「伝染性」もある。

3 つめの解決法として、**型からランタイムコードを生成する方法**がある。
型を JSON Schema に変換し、それを`ajv`などのバリデーションライブラリで使う方法である。
TS のツールチェーンを活用でき、学習コストなしで使える。
デメリットとしてはビルドプロセスの複雑化が挙げられる。

どれが正解ということはなく、トレードオフである。

## 75. DOM の階層を理解する

DOM や DOM イベントには階層構造がある。
これを理解し、型ガードや型アサーションと組み合わせることで、堅牢なコードを書くことが可能になる。

### DOM の階層構造

```txt
EventTarget
  └── Node
      ├── Element
      │   ├── HTMLElement
      │   │   ├── HTMLButtonElement
      │   │   └── ...その他のHTML要素
      │   └── SVGElement
      ├── Text
      ├── Comment
      └── ...
```

- EventTarget
  - 最も基本的なインターフェース
  - すべての DOM 要素が実装する
  - イベントリスナーの登録や削除が可能
  - e.g. `addEventListener()`, `removeEventListener()`などが使える
- Node
  - 親子関係、兄弟関係などを表現するためのインターフェース
  - Element だけでなく、Text ノードや Comment ノードなどを含む
  - e.g. `childNodes`, `appendChild()`などが使える
- Element
  - HTML/XML 要素を表すインターフェース
  - 属性操作、クラス操作、セレクタによる検索機能を提供する
  - e.g. `classList`, `querySelector()`などが使える
- HTMLElement
  - HTML 要素の基底インターフェース
  - e.g. `style`, `onclick`, `hidden`, `dataset`などが使える
- 具体的な要素型(HTMLButtonElement ほか)
  - 各 HTML 要素特有のプロパティ・メソッド
  - `<button>`の場合：`disabled`, `type`, `value`など

### DOM イベントの階層構造

```txt
Event
  ├── UIEvent
  │   ├── MouseEvent
  │   ├── TouchEvent
  │   └── KeyboardEvent
  └── （その他のイベント）
```

- Event
  - すべてのイベントの基底インターフェース
  - `type`, `target`, `preventDefault()`, `stopPropagation()`
- UIEvent
  - ユーザーインターフェース関連イベントの基底
  - `detail`, `view`（window オブジェクト）
- MouseEvent
  - マウス操作に関する情報
  - `clientX/Y`, `pageX/Y`, `button`, `ctrlKey`, `shiftKey`
- TouchEvent
  - タッチ操作の情報
  - `touches`, `targetTouches`, `changedTouches`
- KeyboardEvent
  - キーボード操作の情報
  - `key`, `code`, `ctrlKey`, `shiftKey`, `altKey`
