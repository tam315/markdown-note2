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
  - 少々型エラーがあっても動かせた方が開発時には便利だよね。
  - `noEmitOnError`を使うと、型エラーがあるとトランスパイルしないようにできるけど。
- 型アサーション（キャスト、`as Hoge`）しても実際の値は変わらない。
- ランタイムの値は型と相違しうる。だからこそ、unsound な値(any、型アサーション、構造的部分型のミスユース)はなくすのが大事。
- 関数を型レベルでオーバーロード定義することはできるが、実装は一つしか書けない（どゆこと）。

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

## 8. シンボルが型空間にあるのか値空間にあるのかを知る

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

const person: Person = { name: 'Alice', age: 42 } // エラーになる

const intermidiate = { name: 'Alice', age: 42 }
const person2: Person = intermidiate // エラーにならない
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

(個人的には interface を使うメリットを感じないので、シンプルに type に統一するのがいいと思う)

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

自前オブジェクトに numeric キーを使うと様々な厄災が起きるのでやめよう。

数値をキー名にしたくなったら、配列、タプル、`ArrayLike`(Map を含む)、`Iterable`などで代用しよう。

## 18. 推論できるときは型注釈をつけない

型推論できるものに型注釈を書くのは意味がなく、手間や事故が増えるだけ。

オブジェクトリテラルには型注釈をつけよう。
過剰プロパティチェックが有効になり、エラーを発生場所により近いところで発見できる。

関数の引数には型注釈をつけよう。ただし関数内部のローカル変数には不要。

関数の返り値には基本的に型注釈はつけるな。
ただし、return が複数ある場合や、パブリックに使われる関数である場合、
名前付きの型で返したい場合などは、適宜付けよう。

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
- Narrowing
  - Union 型 → 部分型
  - 実行時情報で型を「厳しく」して安全に扱う

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
```

## 22. Type Narrowing を理解する

TypeScript ではコードがどの場所にあるかによって、値の型が変わりうる。
これは他の言語にはない TS の特徴である。
Type narrowing するには以下のようなやり方がある。

- Null checking
- `instanceof`
- Property checking
- Built-in functions (e.g. `Array.isArray`)
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
  place.name // string | null
}
```

## 24. 型推論でコンテキストがどう使われるか理解する

コンテキストが失われて型エラーになることがある。

```ts
type Language = 'JavaScript' | 'TypeScript'
function setLanguage(language: Language) {}

let language = 'JavaScript' // string
setLanguage(language) // error: string is not assignable to Language
```

対処法は以下の通り。

- Use inline style (Best if appricable)
- Use `const` assertion (定義を間違えると定義時ではなく使用時にエラーがでてわかりづらいので注意)
- Use Type annotation
- Use `satisfies` operator

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
  - 構造的部分型では、値の代入を繰り返す際に Excessive Property Checking が回避され、意図しないプロパティが混入する恐れがあるため

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
