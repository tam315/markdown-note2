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
  - e.g. `app/shop/[...slug]/page.js`だと以下にマッチする
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
ルーティングを変えずに共通レイアウトを複数画面に当てたいときなどに使う。

- `(folder)`

### Private Folders

ルーティング等に一切の影響を与えないフォルダ。
`layout.js`その他のファイルがあっても全て無視される。ファイル整理に使う。

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

Next.js のデータ取得はサーバーサイドでの取得が基本。page, layout, server component 内でデータを取得することができる。

### ブロッキングなデータ取得

- Server Component のレンダリングプロセス内で Promise を await する方法
- fetch したり ORM 叩いたりして OK（まじか）
- 必要に応じて`loading.js`を用意する
  - サーバサイドでデータ取得している間に、ローディング画面を先行して表示することができる。
  - これがないとレンダリングが完全にブロックされる
  - 実のところ Suspense で`page`をラップしてるだけではある

```tsx
const data = await fetch('https://api.vercel.app/blog')
const allPosts = await db.select().from(posts)
```

### Streaming によるデータ取得

サーバーコンポーネントで await していない Promise を用意し、Suspense で囲んだクライアントコンポーネントにわたし、`use`で受け取る方法。
サーバーコンポーネントからクライアントコンポーネントに**Streaming**する(順次データを流し込む)ことができる。

(シリアライズできないものをクライアントに渡せるようになったのね、魔法ですね)

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

## Updating Data

https://nextjs.org/docs/app/getting-started/updating-data

データの更新は Server Functions という仕組みで行う。（2024 後半までは`Server Actions`と呼ばれていたもの）
クライアントコンポーネントからサーバーサイドの関数を呼び出すことを可能にするための仕組みである。
定義の仕方は 2 つある。

### Server Functions の定義

`use server`を使って定義する。これは、「この関数（ファイル）はクライアントから呼び出せるものですよ」という宣言である。

> 'use server' marks server-side functions that can be called from client-side code.

出典: https://react.dev/reference/rsc/use-server

記法は二つある。

- `actions.ts`などの独立したファイルに定義し、Server|Client Component でインポートして使う
  - この場合はファイルの先頭に`'use server'`と書く
  - こちらの方法が推奨される
- Server Component にインラインで定義する
  - この場合は非同期関数の先頭に`'use server'`と書く

### Server Functions の呼び出し

呼び出し方法は Form による方法とイベントハンドラによる方法がある。

### Form による呼び出し(Pending や返り値を扱わない場合)

form の action にそのまま突っ込めば OK。

```tsx
// action.ts
'use server'
export async function createPost(formData: FormData) {}
```

```tsx
// page.ts
import { createPost } from '@/app/actions'
// Reactのformは拡張されており、action属性を受け取ることができる
<form action={createPost}>
```

### Form による呼び出し(Pending や返り値を扱う場合)

Pending や返り値を扱う必要があるなら、`useActionState`フックを使わなければいけない。

```tsx
// page.ts
import { useActionState } from 'react'

// 以下、レンダリングプロセス内で

// stateにはactionの返り値が入る。
// formActionにはactionをラップしたものが入る。
// ちなみに返り値のあるactionをformにそのまま渡すと型エラーになるので注意。
const [state, formAction, pending] = useActionState(createPost, null)
return (
  <button onClick={formAction}>
    {pending ? <LoadingSpinner /> : 'Create Post'}
  </button>
)
```

`useActionState` を使う場合は、Action のシグネチャも変わるので注意。
第一引数に prevState を受け取るように変更しないといけない。
たとえ prevState が不要であってもね。
（useActionState の利用を前提として Action のシグネチャを決めるのが運用としてはシンプルか？）

```ts
export const createPost = async (_prevState: unknown, formData: FormData) => {}
```

### イベントハンドラ内での呼び出し

イベントハンドラなど、フォームの外で Server Function を実行したい時は、トランジション内で実行する必要がある。
ちなみに、Form で使う場合は自動的にトランジション内で実行されているのだよ。

https://react.dev/reference/rsc/use-server#calling-a-server-function-outside-of-form

```tsx
export async function someAction(someArgs: { nandemoOk: string }) {}
```

```tsx
const [isPending, startTransition] = useTransition()

// イベントハンドラ内で
startTransition(async () => {
  const result = someAction({ nandemoOk: 'aaa' })
})
```

↑ こんな感じで、pending も state も自然に扱える。
`useActionState`を使うこともできそうだが、ベストプラクティスがよくわからない。

### Server Functions 関連の参考資料

- https://ja.react.dev/reference/react/useActionState
- https://zenn.dev/uhyo/books/react-19-new/viewer/useactionstate
- https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#server-side-form-validation

### Revalidation

action 実行後の再検証は、Server Function 内で`revalidatePath`や`revalidateTag`を使う。

```tsx
'use server'
import { revalidatePath } from 'next/cache'
export async function createPost(formData: FormData) {
  // Update data and ...
  revalidatePath('/posts')
}
```

### Redirecting

Server Function 内で`redirect`を使う。

```tsx
'use server'
import { redirect } from 'next/navigation'
export async function createPost(formData: FormData) {
  // Update data and ...
  redirect('/posts')
}
```

## Handling Expected Errors

### Server Actions

フォームバリデーションエラーなど。
アクションから普通にエラー情報を整形して返して、クライアント側で`useActionState`を使って煮るなり焼くなりする。

### Server Components

サーバーコンポーネント内でエラーが発生した場合、例えばデータ取得の失敗時などは、Conditional にレンダリングする。

```tsx
const res = await fetch(`https://...`)
const data = await res.json()

if (!res.ok) {
  return 'There was an error.'
}
```

### not found

`not-found.js`を定義した上で、page で`notFound()`を呼ぶことで 404 ページを描写する。

```tsx
import { notFound } from 'next/navigation'

export default async function Profile({ params }) {
  // ...
  if (!user) {
    notFound()
  }
  // ...
}
```

## Handling Unexpected Errors

`error.js`に Error Boundary を書くことで行う。
ネスト可能であり、直近の祖先の`error.js`が利用される。

あまり一般的じゃないけと`global-error.js`を使ってルートレイアウトでエラーをハンドリングすることもできる。
