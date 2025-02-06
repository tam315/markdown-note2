# Next.js - React Essentials

（どのドキュメントをまとめたのか忘れた）

## Server Components

- レンダリングされる場所をサーバ側に固定できるようになった
  - Client Components (及びこれまでの Pages Router)
    - pre-rendering & hydration で動作する。つまりどちらサイドでも描写される可能性がある。
    - 依然として JavaScript が必要
  - Server Components
    - サーバーサイドでのみレンダリングされる
    - クライアントサイドでレンダリングされることはない
    - JavaScript は完全に必要ない
- Server Components にはレンダリングの種類が 2 つある
  - Static Rendering
    - ビルド時に確定するもの
    - SSG, ISR と同じ
    - キャッシュ可
  - Dynamic Rendering
    - リクエスト時に確定するもの
    - SSR(`getServerSideProps()`)と同じ
    - キャッシュ不可
- メリット
  - 速いデータ取得
  - バンドルサイズの減少
  - Ruby on Rails のような開発体験
- App Router ではコンポーネントはデフォルトで Server Components としてレンダリングされる

## Client Components

- インタラクティブ性をもつコンポーネント
- pre-rendered & hydrated される
- 従前の Next.js の Pages Router と同じ
- `use client` directive
  - ファイルの先頭に書くと、Client Components としてレンダリングされる
  - Server のみでレンダリングするものと、Client でもレンダリングするものの**境界を規定**する
  - 配下のコンポーネントはすべて Client Components としてレンダリングされるようになる

## 使い分け

- 以下を行う場合は Server Component が最適
  - データ取得
  - バックエンドへのアクセス
  - Access Token などの機密情報を扱う
  - 大容量の依存ライブラリを使う
- 以下を行う場合は Client Component が最適
  - onClick, onChange 等のインタラクティブ性が必要
  - useState, useEffect などのライフサイクルエフェクトが必要
  - ブラウザ固有の API を使う
  - カスタムフックを使う
  - Class Component を使う

## よくあるパターン

### Client Component を葉に追いやる

そうすることで、Server Component の担当できる領域を増やしていく

### Client Component と Server Component を組み合わせて使う

- サーバーではすべての Server Component が事前にレンダリングされて Client に送られる
- Client Component 内で Server Component をインポートして使うことはできない
  - より具体的には、祖先から子孫に下っていく過程で一つでも`use client`している箇所があれば、その配下では Server Component を使うことはできない
- ただし、Composition の書き方をすれば、Client Component の中に Server Component をネストさせることはできる

```tsx
const SomeServerComponent = () => {
  return (
    <ExampleClientComponent>
      <ExampleServerComponent />
    </ExampleClientComponent>
  )
}
```

### サーバサイド or クライアントサイドでしか使えないコードを明示する

```ts
await fetch('https://external-service.com/data', {
  headers: {
    authorization: process.env.API_KEY,
  },
})
```

例えば上記は`NEXT_PUBLIC`がついていないのでクライアントサイドでは動作しない。
こういうコードを書くときは、以下のようにする。

```bash
npm install server-only
npm install client-only
```

```tsx
import 'server-only'
// or
import 'client-only'
```

こうすることでサーバサイド or クライアントサイドでしか動作しないことを明示＆保証できる。

### Data Fetching

とくに理由がないなら、Server Component でデータ取得を行うのがオススメ

### Third-party packages

`client-only`を書いていないライブラリが多くエラーになることが多いので、[ラップする](https://nextjs.org/docs/getting-started/react-essentials#third-party-packages)と良い。

## Context

Server Component では Context を作ったり使ったりできないので、Composition を使った構成にする必要がある。

Client Component で Context をセットアップして ↓

```tsx
'use client'

import { ThemeProvider } from 'acme-theme'
import { AuthProvider } from 'acme-auth'

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}
```

Server Component でそれをつかう ↓

```tsx
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### Server Components 間でのデータ共有

- Context を使う必要はなく、単に普通の JS の世界の仕組みで共有すれば OK
  - シングルトンなど
