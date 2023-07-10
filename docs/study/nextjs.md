# Next.js - React Essentials

## Server Components

- どこで（Client or Server）レンダリングするか選べるようになった
  - 今までの pre-rendering & hydration とは異なり、JavaScript が完全に必要なくなる
- Server Components はサーバーサイドでのみレンダリングされ、クライアントサイドでレンダリングされることはない
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
  - バンドルサイズの現象
  - Ruby on Rails のような開発体験
- App Router ではコンポーネントはデフォルトで Server Components としてレンダリングされる
- 以下のファイル名は特別な役割を持つ
  - `layout`
  - `page`
  - `loading`
  - `not-found`
  - `error`
  - `global-error`
  - `route`
  - `template`
  - `default`

## Client Components

- インタラクティブ性をもつコンポーネント
- pre-rendered & hydrated される
- 従前の Next.js の Pages Router と同じ
- `use client` directive
  - ファイルの先頭に書くと、Client Components としてレンダリングされる
  - Server のみでレンダリングするものと、Client でもレンダリングするものの**境界を規定する**
  - 配下のコンポーネントはすべて Client Components としてレンダリングされるようになる

## 使い分け
