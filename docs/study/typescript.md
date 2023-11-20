# TypeScript

## satisfiter

- オブジェクトの型を定義するときの、より良い方法
- オブジェクトに変な値が紛れ込むのを防ぎつつ、定数的に利用できるようになる
- 参考：https://zenn.dev/luvmini511/articles/55ad71c1ae99ba

前提

```ts
type Colors = 'red' | 'green' | 'blue';
type RGB = [red: number, green: number, blue: number];
```

悪い例

```ts
const palette: Record<Colors, string | RGB> = {
  red: [255, 0, 0],
  green: '#00ff00',
};

palette.red[1]; // string | number になってしまう
```

良い例

```ts
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies Record<Colors, string | RGB>;

palette.red[1]; // ちゃんとnumber になる
```
