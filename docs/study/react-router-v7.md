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
  // indexはパスなし（デフォルト）
  index('./home.tsx'),

  // routeはパスあり
  route('about', './about.tsx'),

  // 共通レイアウトを使うラウト。ネストではない。
  layout('./auth/layout.tsx', [
    route('login', './auth/login.tsx'),
    route('register', './auth/register.tsx'),
  ]),

  // 特定のprefixを持つラウト。ネストではない。
  ...prefix('concerts', [
    index('./concerts/home.tsx'),
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

`routes.ts`に書いた全てのラウトは、`app/root.tsx`という特殊なラウトモジュールの`<Outlet />`に描写される。

### Layout Routes

`layout()`は共通のレイアウトを使用したい場合に便利。
コンポーネントのネストを作成するが、パス的には何も加えない。

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
      <Outlet />
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

`root.tsx`はルートラウトモジュールという特殊なもので、全てのラウトモジュールの祖先となる。

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

```tsx
export async function loader({ params }) {
  const data = await fetch(`/api/teams/${params.teamId}`)
  return { someData: data }
}
```

### clientLoader

クライアントでのみ呼ばれるローダー。通常のローダーに加えて、もしくは代わりに使う。

```tsx
export async function clientLoader({ serverLoader }) {
  // 必要があればサーバー側のローダーを呼び出すことも可能
  // const serverData = await serverLoader()
  const clientData = getDataFromClient()
  return clientData
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

## Rendering Strategies

レンダリング戦略は以下の 3 つから選べる。
Pre-render はビルド時に画面を生成する手法で、対象ラウトは個別に指定できる。

- Client Side Rendering
- Server Side Rendering
- Static Pre-rendering

## TypeScript

型の情報は`+types`ディレクトリ？に自動生成されるらしい。
この`Route`型が魔法のように型情報を集約し配布する。
ラウトパラメーターも、loader の返り値も、コンポーネントの props も。
以下のように書けばコンポーネントでは型情報が使える。

```tsx
// route("products/:pid", "./product.tsx");
import type { Route } from './+types/product'

export async function loader({ params }: Route.LoaderArgs) {}
export async function clientLoader({ params }: Route.ClientLoaderArgs) {}
export async function action({ params }: Route.ActionArgs) {}
export async function clientAction({ params }: Route.ClientActionArgs) {}

export default function Product({ loaderData }: Route.ComponentProps) {}
```

## Data Loding

- Client Data Loading
  - `clientLoader`を使う
  - `loader`と組み合わせて使うことも可能。その場合は loader->clientLoader の順で実行される
- Server Data Loading
  - `loader`を使う
- Static Data Loading
  - `loader`を使ったうえで、プリレンダリングするパスを指定する

## Actions

- Client Actions
  - ブラウザでのみ実行される
  - 通常の action よりも優先される
- Server Actions
  - サーバーでのみ実行される
  - クライアント側のコードからは削除される

### アクションの呼び出し

宣言的に書くにはフォームを使う。

```tsx
import { Form } from 'react-router'

function SomeComponent() {
  return (
    <Form action="/projects/123" method="post">
      <input type="text" name="title" />
      <button type="submit">Submit</button>
    </Form>
  )
}
```

命令的に書きたい場合は`useSubmit`を使う。

```tsx
import { useSubmit } from 'react-router'
// hooksで呼び出して、
let submit = useSubmit()
// 何かのイベントハンドラー内などにおいて
submit({ quizTimedOut: true }, { action: '/end-quiz', method: 'post' })
```

当該ラウトモジュール以外の Action を叩きたい場合や、ブラウザに履歴を積みたくない場合は`useFetcher`を使う。
[こちらのページ](https://reactrouter.com/how-to/fetchers)に Action で使う例と Loader で使う例がある。

```tsx
import { useFetcher } from 'react-router'

function Task() {
  let fetcher = useFetcher()
  let busy = fetcher.state !== 'idle'

  return (
    // 宣言的に書く場合
    <fetcher.Form
      method="post"
      // いまいるラウトモジュール以外の(アクションだけをもつ独立したラウドモジュールの)アクションを叩くことができる
      action="/update-task/123"
    >
      <input type="text" name="title" />
      <button type="submit">{busy ? 'Saving...' : 'Save'}</button>
    </fetcher.Form>
  )

  // 命令的に書く場合 (どこかのイベントハンドラー内などで)
  // fetcher.submit(
  //   { title: 'New Title' },
  //   { action: '/update-task/123', method: 'post' },
  // )
}
```
