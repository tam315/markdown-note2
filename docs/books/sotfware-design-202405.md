# Software Design 202405

## TypeScript

### 基本

名前的型システムと、構造的型システムがある。

- 名前的型システム
  - 型同士を同じと見なしたり、区別したりする際に、型の名前が重要な枠割りを持つ
  - 無名の型は使えず、明示的に名前を付けなければならない
  - 部分型の関係は明示的に書かないといけない
  - Java, C#, Swift など
- 構造的型システム
  - 型同士を同じと見なしたり、区別したりする際に、型の構造が重要な役割を持つ
  - 無名の型が使える
  - 構造さえ合致していれば、明示せずとも部分型として判断される
  - JS,TS,Go など

複雑な静的型検査をしようとするな。難しい型定義を書いても後の人がメンテナンスできない。値を動的に検査してエラー画面を出せば済むんじゃないのか？と考えるべき。

### 型表現

`type Hoge` のように、型に名前を付けて定義したものを型エイリアスという。

const と let で型推論の結果が異なる。const はリテラル型を持つ。

```typescript
const a = 1; // `1`というリテラル型
let b = 1; // number型

const c = 'me'; // `me`というリテラル型
let d = 'me'; // string型
```

オブジェクトを const で定義しても、プロパティの型はリテラル型にならない。このようにプロパティがより広い型に拡大されることを widening(型の拡大)という。これを避けたい場合は`as const`を使う。さらに、型を制限しつつ widening を避けたい場合は`satisfies`を使う。

```typescript
// aはnumber型
const obj = { a: 1 };

// aは`1`というリテラル型
const obj = { a: 1 } as const;

// 結果は同上だが、aに数値以外を与えるとちゃんとエラーになる。
// satisfiesではなく型注釈で縛ると、aがnumber型になってしまう点に注意。
const obj = { a: 1 } as const satisfies { a: number };
```

### Union 型

これを使いこなせると強い。Enum という似た機能もあるがオワコンなので Union 型を使うべき。

リテラル型 x Union 型 x switch 文の組み合わせが最強。

その際、Union 型が拡張されたときに静的にチェックできるように、default 句でチェックをするとよい。書き方はいくつか流派があるが satisfies が一番シンプルそう。

```typescript
type Hoge = 'a' | 'b' | 'c';
let x: Hoge;

switch (x) {
  case 'a':
    // do something
    break;
  case 'b':
    // do something
    break;
  case 'c':
    // do something
    break;
  default:
    x satisfies never;
}
```

TypeScript ではクラスと`instanceof`で判定する方法は避けられがちで、タグ付きユニオンを使うのが主流。

一例として、throw と try-catch の代わりに、Result 型を定義して、エラーを値として返すようにするのは有効。

```typescript
type Result<T, E> = { success: true; value: T } | { success: false; error: E };
```

### 構造的型付け

階層構造の上位に位置する型を基本型、supertype という。抽象的な型である。

階層構造の下位に位置する型を部分型、subtype という。基本型を引き継ぎつつ、新たな性質や振る舞いを持つ。`部分`というキーワードとは直感的に反する気もするが。

名前的型システムでは、部分型の関係を明示的に書かないといけない。このような部分型を名前的部分型（nominal subtype）という。

構造的型システムでは、構造さえ合致していれば、明示せずとも部分型として判断される。このような部分型を構造的部分型（structural subtype）という。

なぜ TS で構造型型付けが採用されたかというと、もともと JavaScript では実行時の振る舞いによって型を判断する、いわゆる「ダックタイピング」が多用されてきた経緯があり、その流れを引き継いだから。また、JavaScript にはオブジェクトリテラルという、クラスやインターフェースをすっ飛ばしていきなりオブジェクトを生成する機能があり、これを活かすという動機もあった。

### Mapped Types

Mapped Types は必要な箇所でピンポイントで使うのが肝心。普通に使うには難しすぎるし、読み手の負担が大きすぎるし、エラーも読みづらくなる。自分のプログラムに必要な水準の型抽象の水準を見極めよ。現実的なユースケースは、ライブラリ作者として提供するインターフェースに使うのが現実的なユースケース。「値をまるっと渡したらいい感じに推論されている」というのが理想。

#### 条件型

条件型は、入力された型に対して別の型を返す関数のようなもの。`A extends B ? C : D`のように書く。Mapped Types を使うための必須知識。

ここで言う extends はクラスの継承(`class C extends ...`)や、型引き数に対する制約(`type X<K extends string>`)に使うものとは全く異なる。くっっっそややこしいので注意。

```typescript
type F<T> = T extends { v: boolean } ? 1 : 2;
type R1 = F<{ v: true }>; // 1
type R2 = F<{ v: 'hello' }>; // 2
```

#### infer キーワード

条件型では`infer`キーワードを使って、事前に知りえない型情報をとり出すことができる。infer は条件分岐の真の側でのみ使える。

```typescript
type ValueType<T> = T extends { value: infer U } ? U : never;
type _ = ValueType<{ value: number }>; // number
```

#### keyof キーワード

`keyof`キーワードは、オブジェクトのプロパティ名を Union 型として返す。

```typescript
type Props = { a: number; b: string };
type _ = keyof Props; // 'a' | 'b'
```

#### in キーワード

オブジェクト型のキー部分で特殊な宣言を行うための演算子。型レベルのイテレーターといえる。in 演算子で Union 型を展開するしくみを Mapped Types という。

```typescript
type Props = { a: number; b: string };

// 以下は、元の型と一緒の { a: number; b: string } になる。これがMapped Type。
type _ = {
  [k in keyof Props]: Props[k]; // keyof Props は 'a' | 'b'
};

// 以下のように展開されると考えるとわかりやすい。
type _ = {
  ['a']: Props['a'];
  ['b']: Props['b'];
};
```

Mapped Types を使って Pick を再開発すると以下のようになる。

```typescript
type Pick2<TargetObject, PickKeys extends keyof TargetObject> = {
  [PickKey in PickKeys]: TargetObject[PickKey];
};

type _ = Pick<{ a: string; b: number }, 'a'>; // { a: string }
```
