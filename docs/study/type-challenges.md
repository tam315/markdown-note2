# Type challenges

## キホンのキ

[こちらの記事](https://creators.bengo4.com/entry/2023/12/22/000000)が参考になる

### Narrowing

型引数に対して`extends`を使うと、受け取れる型を狭めることができる

```ts
// valueはstringかnumberのどちらかしか受け取れない
type Sample<T extends string | number> = { value: T };
```

### Conditional Types / 条件付き型

- `extends`を右辺で使うことで、もし T が U なら X,そうでなければ Y を返す、というような処理ができる
- `T extends U ? X : Y`

#### Distributive Conditional Types / ユニオン型の分配法則

- Conditional Types の T が Union 型だった場合には、総当りで処理され、結果が再びユニオンとして結合される

#### never

- Conditional Types と併用して、型を返したくない時に使う

Distributive Conditional Types と never を使うと、以下のようなことができる

```ts
type MyExclude<T, U> = T extends U ? never : T;

type Sample = MyExclude<
  string | number | bigint | object | boolean | Function,
  number | boolean
>;
// => string | bigint | object | Function
```

#### infer

- Conditional Types 内で型変数を抽出できる
- 型引数(`<>`)が与えられてが計算が完了している型から、もとの型変数を取り出すのに使える

```ts
type ExtractType<T> = T extends Array<infer U> ? U : never;

type Sample = ExtractType<Array<string>>; // string
```

### Map Types

- 既存の型を操作し新しい型を生成する機能
- 既存の型の各プロパティを変更、追加、削除できる

```ts
type Person = {
  name: string;
  age: number;
};

// すべてのプロパティをオプショナルにする
type PartialPerson = {
  [K in keyof Person]?: Person[K];
};
```

### その他

- `SomeArr[number]`で、配列型を Union 型に変換できる

  ```ts
  type List = (string | number | boolean)[];

  // - string | number | boolean になる
  // - 配列が持ちうる全ての型を、Union型にまとめる感じ
  type Elem = List[number];
  ```

## --- Challenges - Easy ---

## Pick

```ts
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = MyPick<Todo, 'title' | 'completed'>;

const todo: TodoPreview = {
  title: 'Clean room',
  completed: false,
};
```

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

## Readonly

```ts
interface Todo {
  title: string;
  description: string;
}

const todo: MyReadonly<Todo> = {
  title: 'Hey',
  description: 'foobar',
};
```

```ts
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

## Tuple to object

```ts
// as const の表記が重要。
// - これがあるから、typeof tuple は ['tesla', 'model 3', 'model X', 'model Y'] という配列型になる
// - これがないと、typeof tuple はただのstring[]になる
const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const;

// expected { tesla: 'tesla', 'model 3': 'model 3', 'model X': 'model X', 'model Y': 'model Y'}
const result: TupleToObject<typeof tuple>;
```

```ts
type TupleToObject<T extends readonly string[]> = {
  [P in T[number]]: P;
};
```

## First of Array

```ts
type arr1 = ['a', 'b', 'c'];
type arr2 = [3, 2, 1];

type head1 = First<arr1>; // expected to be 'a'
type head2 = First<arr2>; // expected to be 3
```

```ts
type First<T extends any[]> = T extends [] ? never : T[0];
```

## Length of Tuple

```ts
type tesla = ['tesla', 'model 3', 'model X', 'model Y'];
type spaceX = [
  'FALCON 9',
  'FALCON HEAVY',
  'DRAGON',
  'STARSHIP',
  'HUMAN SPACEFLIGHT',
];

type teslaLength = Length<tesla>; // expected 4
type spaceXLength = Length<spaceX>; // expected 5
```

```ts
type Length<T extends any[]> = T['length'];
```

## Exclude

```ts
// expected string | Function
type Sample = MyExclude<string | number | boolean | Function, number | boolean>;
```

```ts
type MyExclude<T, U> = T extends U ? never : T;
```

## Awaited

```ts
type MyPromise = Promise<number>;
// expected number
type MyPromiseResult = Awaited<MyPromise>;
```

```ts
type Awaited<T extends Promise<any>> = T extends Promise<infer A> ? A : never;
```

## If

```ts
type A = If<true, 'a', 'b'>; // expected to be 'a'
type B = If<false, 'a', 'b'>; // expected to be 'b'
```

```ts
type If<T, U, V> = T extends true ? U : V;
```

## Concat

```ts
type Result = Concat<[1], [2]>; // expected to be [1, 2]
```

```ts
type Concat<T extends any[], U extends any[]> = [...T, ...U];
```

## Includes

```ts
// expected to be `true`
type IsIncluded = Includes<['BMW', 'Mercedes', 'Audi'], 'BMW'>;
```

```ts
type Includes<T extends any[], U> = U extends T[number] ? true : false;
```

## Push

```ts
type Result = Push<[1, 2], 3>; // [1, 2, 3]
```

```ts
type Push<T extends any[], U> = [...T, U];
```

## Unshift

```ts
type Result = Unshift<[1, 2], 0>; // [0, 1, 2]
```

```ts
type Unshift<T extends any[], U> = [U, ...T];
```

## Parameters

```ts
type MyFunction = (i: number, s: string) => void;
// expects [i: number, s: string]
type MyParameter = Parameter<MyFunction>;
```

```ts
type Parameter<T> = T extends (...args: infer A) => any ? A : never;
```

## --- Challenges - Medium ---

## Get Return Type

```ts
const fn = (v: boolean) => {
  if (v) return 1;
  else return 2;
};

type a = MyReturnType<typeof fn>; // should be "1 | 2"
```

```ts
type MyReturnType<T> = T extends (...args) => infer R ? R : never;
```

## Omit

```ts
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = MyOmit<Todo, 'description' | 'title'>;

const todo: TodoPreview = {
  completed: false,
};
```

```ts
type MyOmit<T, U> = {
  [P in Exclude<keyof T, U>]: T[P];
};
```

## Readonly 2

```ts
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

const todo: MyReadonly2<Todo, 'title' | 'description'> = {
  title: 'Hey',
  description: 'foobar',
  completed: false,
};

todo.title = 'Hello'; // Error: cannot reassign a readonly property
todo.description = 'barFoo'; // Error: cannot reassign a readonly property
todo.completed = true; // OK
```

```ts
type MyReadonly2<T, K extends keyof T> = T & {
  readonly [P in K]: T[P];
};
```

## Deep Readonly

pass
あまりいい実装がない

## Tuple to Union

```ts
// 変数ではなく tuple type である点に注意
type Arr = ['1', '2', '3'];
const a: TupleToUnion<Arr>; // expected to be '1' | '2' | '3'
```

```ts
type TupleToUnion<T extends any[]> = T[number];
```
