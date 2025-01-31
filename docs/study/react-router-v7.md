# React Router v7 (ex. Remix)

## Installation

```bash
npx create-react-router@latest my-react-router-app
```

## Routing

### 設定

`app/routes.ts`に書く。
各ラウトは URL パターンとファイルパス（=Route modules）の組み合わせからなる。
Route modules については詳細後述。

```ts
// app/routes.ts
import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from '@react-router/dev/routes'

export default [
  // パス未指定のラウトは index で表現
  // 親（ここの場合root.tsx）のOutletに描写される
  index('./home.tsx'),

  // パスを指定するラウトは route で表現
  route('about', './about.tsx'),

  // 共通レイアウトを使うラウトの表現
  layout('./auth/layout.tsx', [
    route('login', './auth/login.tsx'),
    route('register', './auth/register.tsx'),
  ]),

  // ネストされたラウトの表現
  ...prefix('concerts', [
    index('./concerts/home.tsx'), // 親（ここの場合root.tsx）のOutletに描写される
    route(':city', './concerts/city.tsx'),
    route('trending', './concerts/trending.tsx'),
  ]),
] satisfies RouteConfig
```

v7 ではコンフィグベースがデフォルトになった模様だが、
ファイルベースも設定すれば使えるし、混在も可能。

### Nested Routes

ラウトはネスト可能。

```tsx
export default [
  route('dashboard', './dashboard.tsx', [
    index('./home.tsx'), // `/dashboard`のときに描写される子ラウト
    route('settings', './settings.tsx'), // `/dashboard/settings`のときに描写される子ラウト
  ]),
] satisfies RouteConfig
```

子ラウトの描写は`<Outlet />` で行う。

```tsx
import { Outlet } from 'react-router'

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* will either be home.tsx or settings.tsx */}
      <Outlet />
    </div>
  )
}
```

### Root Route

`routes.ts`に書いた全てのラウトは、`app/root.tsx`という特殊なラウトモジュールの下にネストして配置される。

### Layout Routes

`layout()`はネストを作成するが、パス的には何も加えない。

```tsx
layout('./marketing/layout.tsx', [
  /* このレイアウトで描写したいラウト群 */
])
```

レイアウトのコンポーネントで`<Outlet/>`を使うことで、ネストされたラウトを描写できる。

```tsx
export default function ProjectLayout() {
  return (
    <div>
      <aside>Example sidebar</aside>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
```

### Index Routes

`index()`で書いたラウトは、**親の`Outlet`**に描写される。
トップレベルなら`root.tsx`の Outlet に、ネストされた場合は親の Outlet に描写される。

### Route Prefixes

`prefix()`は、指定したパスの前にプレフィックスを追加する。
わざわざラウトをネストするまでもない場合に便利。

### Dynamic Segments

`:city`のように Dynamic Segment を書くと、URL から値を取得できる。パースされて型がつく。

```tsx
import type { Route } from './+types/team'

export async function loader({ params }: Route.LoaderArgs) {
  //                           ^? { teamId: string }
}

export default function Component({ params }: Route.ComponentProps) {
  params.teamId
  //        ^ string
}
```

### Optional Segments

`?`をつけると、そのセグメントはオプショナルになる。

```tsx
// OptionalなDynamic Segmentの例
// langはあってもなくてもいい
route(':lang?/categories', './categories.tsx')

// OptionalなStatic Segmentの例
// editはあってもなくてもいい
route('users/:userId/edit?', './user.tsx')
```

### Splats

いわゆる catch-all とか star といわれるもの。

```tsx
route('files/*', './files.tsx')

// とすると以下のように利用できる

export async function loader({ params }: Route.LoaderArgs) {
  const { '*': splat } = params
  // splatには /files/ 以降のパスが全部入っている
}
```

## Route Module

ラウトモジュールは以下の機能を実現するための要となっている。

- automatic code-splitting
- data loading
- actions
- revalidation
- error boundaries

ラウトモジュールは以下のように書く。

```tsx
// `route("teams/:teamId", "./team.tsx")` の場合
// こうするとラウトに関する型情報が得られる
import type { Route } from './+types/team'

// デフォルトでエクスポートしたものがコンポーネントとして描写される
export default function Component({ loaderData }: Route.ComponentProps) {
  return <h1>{loaderData.someData}</h1>
}
```

### Root Route Module

`root.tsx`はルートラウトモジュールという特殊なもので、全てのラウトの祖先となる。

### Props

- `loaderData` - loader 関数の返値
- `actionData` - action 関数の返値
- `params` - ラウトパラメータ
- `matches` - 現在のラウトツリーでマッチするものの配列

それぞれ hooks でも取得可能で、型も自動でつくのでそっちの方がいいかもね。とのこと。マジ？

### 以下、ラウトモジュールからエクスポートするもの

### loader

コンポーネントがレンダリングされる前に取得したいデータがある場合に使う。
クライアント上で実行されることはなく、サーバーサイドもしくはプリレンダリング時にのみ実行される。

### clientLoader

クライアントでのみ呼ばれるローダー。通常のローダーに加えて、もしくは代わりに使う。

```tsx
export async function clientLoader({ serverLoader }) {
  // 通常のローダーの結果を使いたい場合
  const serverData = await serverLoader()
  // クライアントで取得したいデータ
  const clientData = getDataFromClient()
  return { ...serverData, ...clientData }
}
```

### action

サーバーサイドのデータ変更を行うための関数。
実行後にはリバリデーションが自動的に行わ、すべての loader が再実行される。
`<Form>`,`useFetcher`,`useSubmit`などを使って実行する。

```tsx
export default function Items({ loaderData }) {
  return (
    <div>
      <Form method="post" navigate={false} action="/list">
        <input type="text" name="title" />
        <button type="submit">Create Todo</button>
      </Form>
    </div>
  )
}

export async function action({ request }) {
  const data = await request.formData()
  // DBに登録する処理 goes here
  return { ok: true }
}
```

### clientAction

クライアント側でのみ実行される action。

```tsx
export async function clientAction({ serverAction }) {
  // クライアント側でのみ実行したい処理 goes here

  // 必要があればサーバー側のアクションを呼び出すことも可能
  // const data = await serverAction();
  return { ok: true }
}
```

### ErrorBoundary

これがエクスポートされていると、ラウト内でエラーが発生した場合に描写される。
ルートラウトモジュールにおいては必須である。

### HydrateFallback

これがエクスポートされていると loader でのロード中に表示される。
普通はロードが完了するまで何も表示されない。

```tsx
export function HydrateFallback() {
  return <p>Loading Game...</p>
}
```

### headers

サーバーレンダリング時のレスポンスヘッダーを設定する。

```tsx
export function headers() {
  return {
    'X-Stretchy-Pants': 'its for fun',
    'Cache-Control': 'max-age=300, s-maxage=3600',
  }
}
```

### handle

ここでセットした値は`useMatches()`で受け取ることができる。
パンくずリストを作りたい時などに使う。

### links,meta

`<head>`内に追加したい`<link>`や`<meta>`を設定する。
最終的に全ての links や meta は集約されて、`root.tsx`の`<Links />`や`<Meta />`で描写される。

### shouldRevalidate

アクション実行後に再検証したいかどうかを設定する。
