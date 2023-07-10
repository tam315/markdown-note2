# Next.js - Data Fetching

## 概要

### `fetch()` API

Next.js では、[fetch Web API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)を拡張したものが使われる。

- React が fetch を拡張し、リクエストの重複排除・バッチングの機能を追加している
- Next.js が fetch を拡張し、caching と revalidation の機能を追加している

### サーバでのデータ取得

以下の理由で常におすすめ

- DB などのバックエンドリソースに直接アクセスできる
- API Key などの秘匿情報をクライアントに露出させなくてよい
- データの取得とレンダリングをサーバサイドで一括して行えることで、通信の待ち時間やレンダリングの時間が短縮される
- クライアントからのリクエストが 1 回で終わる
- Waterfall を減らせる

### コンポーネントレベルでのデータ取得

- Layout, Pages, Server Components の中でデータ取得ができる
- Streaming や Suspense が使える
- layout からその子コンポーネントへ取得したデータを渡すことはできない。
  - 必要があればデータを必要とするコンポーネントでデータを取得せよ
  - たとえ重複したとしても cache and dedupe の機能があるから気にするな

### 並行 or 逐次データ取得

- 可能な限り並行でデータ取得することを推奨。
- 普通に書くと逐次取得になる。`Promise.all`を使うことで並行取得が可能になる。
- 詳細は[こちら](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching#data-fetching-patterns)。

### 重複排除

- fetch を使う限り、Next.js が自動でリクエストの重複排除とキャッシングを行う
- キャッシュは、サーバサイドではレンダリングプロセスが終わるまで、クライアントサイドではページリロードが起きるまで保持される

### 静的データ取得 or 動的データ取得

- Static Data
  - めったに更新されないもの
  - e.g. ブログポスト
- Dynamic Data
  - 頻繁に更新されるもの
  - e.g. ショッピングカード

デフォルトでは Static Data Fetching が使われるので、ビルド時に 1 度だけデータソースにアクセスし、以降は Next.js によりキャッシュが返され続ける(ISR)。この挙動は変更することが可能。

詳細は[こちら](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching#static-data-fetching)。

### データのキャッシング

- ISR の話。
- キャシングとは、CDN 等にデータを保持することでデータソースにアクセスする回数を減らせる仕組み
- Vercel を使えばグローバルに分散＆共有されたキャッシュが使える

### データの再検証

- ISR の話。2 種類の再検証の仕組みがある。
  - Background Revalidation
  - On-demand Revalidation

詳細は[こちら](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating)。

## Data Fetching 詳細

### Server Components でのデータ取得

- `async` / `await` が使える
- `cookies()`や`headers()`などの便利な関数も用意されている

```tsx
export default async function Page() {
  const data = await getData();

  return <main></main>;
}
```

### Client Components でのデータ取得

- 現状では`react-query`などを使ってください
- 将来的には`use`を使ってもっといい感じになるかも
