# Next.js - Getting Started

https://nextjs.org/docs/app/getting-started

## Installation

```sh
npx create-next-app@latest
```

## Project Structure

### 特別な意味を持つファイル名

- `layout`
  - 複数のページで共有される UI
  - 状態を維持しリセットされない
- `page`
  - 特定のラウトで表示される UI
- `loading` Loading UI
- `not-found` Not Found UI
- `error` Error UI
- `global-error` Global Error UI
- `route` API Endpoint
- `template`
  - Re-rendered layout
  - Layout とほぼ同じだが、ページが切り替わると状態が都度リセットされる点が異なる
- `default` Parallel route fallback page?

### Nested Routes の表現

- `folder` Route Segment
- `folder/folder` Nested Route Segment

### Dynamic Routes の表現

- `[folder]` Dynamic Route Segment
- `[...folder]`
  - Catch-all Route Segment
  - e.g. `app/shop/[[...slug]]/page.js`だと以下にマッチする
    - `/shop/clothes`
    - `/shop/clothes/tops`
    - `/shop/clothes/tops/t-shirts`
- `[[...folder]]` Optional Catch-all Route Segment
  - e.g. `app/shop/[[...slug]]/page.js`だと以下にマッチする
    - `/shop` (ここだけ違う)
    - `/shop/clothes`
    - `/shop/clothes/tops`
    - `/shop/clothes/tops/t-shirts`

### Route Groups

ルーティングに影響を与えずにファイルを構造化するための仕組み。
ある共通レイアウトを複数画面に当てつつ、ルーティングには影響を与えたくない時などに使う。

- `(folder)`

### Private Folders

ルーティングに影響を与えないフォルダ。ファイル整理に使う。

- `_folder`

### Parallel Routes

https://nextjs.org/docs/app/building-your-application/routing/parallel-routes

1 つの URL に対して複数の UI ツリー（レイアウトやコンポーネント群）を同時にレンダリングする仕組み。
レイアウトを画面左右で分割するとか、データ取得を分離したい場合などに使える。

- `@folder`
  - Named slot
  - 親 Layout の props に渡される
  - ルーティングには影響しない

### Intercepted Routes

https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes

ルート遷移の際に特定のルートパラメータやセグメントを「横取り」し、実際のレンダリング対象を差し替える仕組み。
URL は変わるが、画面全体の遷移はさせずに、詳細画面などをモーダルとして表示し、バックグラウンドはそのまま維持するシナリオで使える。
以下でいう「レベル」はフォルダ階層ではなく、セグメント（ルーティング階層）のことなので注意。

- `(.)folder` 同じレベルをインターセプト
- `(..)folder` 親レベルをインターセプト
- `(..)(..)folder` 親の親レベルをインターセプト
- `(...)folder` ルートレベルをインターセプト

### Metadata file

- `favicon.ico`
- `icon.(ico|jpg|png|svg...)`
- `apple-icon.(png|jpg|svg...)`
- `opengraph-image.(png|jpg|svg...)`
- `twitter-image.(png|jpg|svg...)`
- `sitemap.(xml|js|ts)`
- `robots.(txt|js|ts)`

### コンポーネントの階層

コンポーネントは以下の順序で階層化される。
ネストしている場合は再帰的にネストされる。

- `layout.js`
- `template.js`
- `error.js` (React error boundary)
- `loading.js` (React suspense boundary)
- `not-found.js` (React error boundary)
- `page.js` or nested `layout.js`

### ファイル構造を考える時のポイント

- `page.js`と`route.js`だけがクライアントから直接アクセス可能
- なので他のファイルを同じフォルダに配置しても原則として安全といえる
- ファイルの構造化に Private Folders は便利なので活用されたい
- よくあるファイル構造は以下の通り
  - ビジネスロジックは全て app の外または直下に置き、route フォルダはルーティングのためだけに使う
  - Feature や Route ごとにフォルダを作り、ビジネスロジックもそこに置く

## Layouts and Pages

Next.js はファイルベースのルーティングを採用している。

ネストしたルートがある場合でも、実際に表示されるのは最下層の`page`ファイルだけである。
ただし`layout`が複数ある場合は、それらはネストして表示される。

ページ間のリンクは以下のように行う。

```tsx
import Link from 'next/link'
return <Link href={`/blog/${post.slug}`} />
```

詳細略。

## Images and Fonts

https://nextjs.org/docs/app/getting-started/images-and-fonts

### Static Assets

`public` フォルダに配置すると、`/` から始まるパスでアクセスできる。

### Optimizing images

`<Image/>` コンポーネントを使うと、画像の最適化が行われる。

ローカルアセットは何もしなくてもビルド時に勝手に最適化される。

リモートアセットはレイアウトシフトを防ぐために幅と高さの指定が必要。
また、安全のために読み込み先 URL を事前に`next.config.js`で設定する必要がある。

### Optimizing fonts

Google Font を自前でサーブするよう最適化(`next/font/google`)したり、ローカルフォントを最適化して読み込んだり(`next/font/local`)できる。
詳細略。

## CSS

https://nextjs.org/docs/app/getting-started/css

以下が使える。セットアップ手法が書いてある。詳細略。

- CSS Modules
- Global CSS
  - 例えば`app/global.css`を作成し、`app/layout.tsx`で import すれば OK
- Tailwind
- Sass
- CSS-in-JS (ant とか mui とか。ただし emotion は未サポート)

## Fetching Data

Next.js のデータ取得はサーバーサイドでの取得が基本。

### ブロッキングなデータ取得

- Server Component のレンダリングプロセス内で Promise を await する方法
- fetch したり ORM 叩いたりして OK（まじか）
- データ取得が終わるまでレンダリング全体がブロックされる
- 必要に応じて`loader.js`を用意する
  - サーバサイドでデータ取得している間に、別の画面を先行して表示することができる。
  - 実のところ Suspense で`page`をラップしてるだけ
  - なくても最上位の Suspense が適用される？

```tsx
const data = await fetch('https://api.vercel.app/blog')
const allPosts = await db.select().from(posts)
```

### Streaming によるデータ取得

サーバーコンポーネントで await していない Promise を用意し、Suspense で囲んだクライアントコンポーネントにわたし、`use`で受け取る方法。
サーバーコンポーネントからクライアントコンポーネントに**Streaming**する(順次データを流し込む)ことができる。
タイトルや説明文などを先行して表示し、データ取得が終わりしだい本文を表示するようなケースで便利。

```tsx
// Awaitしてない点に注意
const posts = getPostsAsync()

return (
  // Suspense で必ずラップする必要ある
  // Promiseが未解決の間は fallback が表示される
  <Suspense fallback={<div>Loading...</div>}>
    <Posts posts={posts} />
  </Suspense>
)
```

子側では`use`を使って Promise を受け取る。

```tsx
'use client'
import { use } from 'react'

export default function Posts({
  posts,
}: {
  posts: Promise<{ id: string; title: string }[]>
}) {
  const allPosts = use(posts)

  return <div>....</div>
}
```
