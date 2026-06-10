# Tanstack Query (ex. React Query)

## 原典

[https://tanstack.com/query/latest/docs/react/overview](https://tanstack.com/query/latest/docs/react/overview)

## 概要

- Server state(バックエンドのデータ)を fetching, caching, synchronizing and updating するためのライブラリ
- Server state は、ローカルの同期的なデータとは根本的に性質が異なる。にもかかわらず、redux のようなものでそれを管理してきたけど、辛いよね。私に頼りなさい。

## インストール

```sh
yarn add react-query
```

```jsx
// App.tsx
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <MyApp />
    </QueryClientProvider>
  );
}
```

## 使い方

```jsx
// MyComponent.tsx
import { useQuery } from 'react-query';

function MyComponent() {
  const { isLoading, error, data } = useQuery('repoData', () =>
    fetch('https://api.github.com/repos/tannerlinsley/react-query').then(
      (res) => res.json()
    )
  );

  if (isLoading) return 'Loading...';

  if (error) return 'An error has occurred: ' + error.message;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{' '}
      <strong>✨ {data.stargazers_count}</strong>{' '}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  );
}
```

## デフォルト設定に関する注意

デフォルト設定を知っておかないと罠にはまるのでここはきちんと抑えておくこと。

- キャッシュデータは stale として扱われる(`staleTime`)。このため、下記の場合にデータが自動的に再取得される。
  - クエリを使用する新しいコンポーネントがマウントされた時(`refetchOnMount`)
  - ウィンドウが再フォーカスされた時(`refetchOnWindowFocus`)
  - ネットワークが再接続された時(`refetchOnReconnect`)
  - 再取得の間隔が明示的にセットされている時(`refetchInterval`)
- どのコンポーネントにも使用されていないキャッシュデータは`inactive`としてしばらく残るが、5 分後に削除される(`cacheTime`)。
- 失敗したクエリは自動的に３回再試行される。間隔は指数関数的に伸びる。(`retry`, `retryDelay`)
- クエリ結果は[Structural Sharing](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2)という仕組みで保持されている。これにより、本当に値が変わった時にだけ最小限のオブジェクトの参照が変更される。これは、ほとんどの場合で効率的である。

## Query

- クエリするには下記の２つが必要
  - ユニークなキー
  - Promise(データを resolve するか、エラーを投げる)

```ts
const result = useQuery('todos', fetchTodoList);
// or
const result = useQuery({
  queryKey: 'todos',
  queryFn: fetchTodoList,
});
```

### Status

Status は`data`に関する情報である。`data`を持っているかどうかを示す。

- `isLoading` or `status === 'loading'` データがまだ存在しない状態 (通信中かどうかは関係しないので注意)
- `isError` or `status === 'error'` エラーが発生した状態
  - `error` エラーの内容
- `isSuccess` or `status === 'success'` データ取得が成功した状態
  - `data` データ

`!isLoading && !isError`であることをチェックすれば、Type Narrowing が効くので、`data`にアクセスできる。

### FetchStatus

FetchStatus は`queryFn`に関する情報である。`queryFn`が動作中かどうかを示す。

- `fetchStatus === 'fetching'` or `isFetching` - 通信中である
- `fetchStatus === 'paused'` or `isPaused` - 通信したいがオフラインなどの理由により保留中
- `fetchStatus === 'idle'` - 通信していない

### なぜ 2 つのステータスが必要だったのか

Background refetches と stale-while-revalidate の仕組みがあることにより、上記ステータスのあらゆる組み合わせが発生しうるため。

## Query Key

- クエリキーに基づいてキャッシュが行われる
- シリアライズ可能な値ならなんでもキーとして使用できる

```ts
useQuery('todos', ...)
// queryKey === ['todos']

useQuery(['todo', 5], ...)
// queryKey === ['todo', 5]

useQuery(['todo', 5, { preview: true }], ...)
// queryKey === ['todo', 5, { preview: true }]

// なお、下記は同じものとして扱われる
useQuery(['todos', { status, page }], ...)
useQuery(['todos', { page, status }], ...)
```

クエリ関数が変数に依存している場合、例えば特定の id 等に基づいてクエリが実行されるなどの場合は、クエリキーにもその変数を含めること。

```ts
function Todos({ todoId }) {
  const result = useQuery(['todos', todoId], () => fetchTodoById(todoId));
}
```

## Query Functions

Query Functions = クエリを実行する(データを取得する)関数のこと。

- データ取得に失敗した時は必ずエラーを投げるもしくは`Promise.reject()`を返すこと。
  - そうすることで React Query は適切にエラーをハンドリングできる
  - `axios`と異なり、`fetch`はデフォルトではエラーを投げないので注意する

```ts
useQuery(['todos', todoId], async () => {
  const { ok, json } = await fetch('/todos/' + todoId);
  if (!ok) {
    throw new Error('Network response was not ok');
  }
  return json();
});
```

- Query function にはコンテキストが渡されるので、必要に応じて使用するとよい
  - `queryKey`や AbortSignal など

```ts
function Todos({ status, page }) {
  const result = useQuery(['todos', { status, page }], fetchTodoList);
}

function fetchTodoList({ queryKey }) {
  const [_key, { status, page }] = queryKey;
  return new Promise();
}
```

## Network Mode

3 つのモードがある

### `online`

デフォルトはコレ

- ネットワーク接続があるとき
  - クエリが実行される
- ネットワーク接続がないとき
  - クエリは実行されず、Status の値は従前の`loading`,`error`,`success`の状態を維持する。
  - `fetchStatus`は`pending`になる
- クエリ実行している最中にネットワーク接続を失ったとき
  - リトライ機能は無効化される
  - ただし`refetchOnReconnect`は実行される(これは正確には再取得というよりは継続というべき性質のものだから)

### `always`

ネットワークを使用せず、AsyncStorage などで完結している場合に最適

- ネットワーク接続状態を考慮せず、常にクエリが実行される
- `fetchStatus`が`paused`になることはない
- リトライが pause されることもなく、失敗時には直ちに`error`状態になる
- `refetchOnReconnect`はデフォルトで無効化される

### `offlineFirst`

（online と always の中間とのことだがちょっとよくわからん）

## クエリを並列で実行する

- `useQuery`を並べて書けば OK
- ただし、配列に基づいてクエリしたい場合や、suspense mode を使っている場合は`useQueries`を使う必要がある

```ts
const userQueries = useQueries(
  users.map((user) => {
    return {
      queryKey: ['user', user.id],
      queryFn: () => fetchUserById(user.id),
    };
  })
)``;
```

## クエリを直列に実行する

- クエリの実行結果を使って別のクエリを実行するには、`enabled`オプションを使用する。

```ts
// まずはユーザIDを取得する
const { data: user } = useQuery(['user', email], getUserByEmail);
const userId = user?.id;

// 次にユーザIDを使用してプロジェクトを取得する
const {
  status,
  fetchStatus,
  data: projects,
} = useQuery(['projects', userId], getProjectsByUser, {
  // userIDが存在する場合のみこのクエリを実行する
  enabled: !!userId,
});
```

project の status, fetchStatus は以下の通り遷移することになる。

```txt
✅最初の状態
status: 'loading'
fetchStatus: 'idle'

✅ユーザの取得が終わって`enabled`が`true`になった時
status: 'loading'
fetchStatus: 'fetching'

✅projectが取得できたあと
status: 'success'
fetchStatus: 'idle'
```

## バックグラウドでの通信をユーザに知らせるには

- `isFetching`を使えばよい
  - `isFetching`はリトライやリフェッチなどを含め、あらゆる通信で`true`となる
  - `isLoading`は初回データ取得のとき(過去に 1 度もデータを取得できていない状態のとき)だけ`true`となる
- アプリ全体での通信状態を取得したい場合は`useIsFetching`を使用する

## Window Focus Refetching

- デフォルトで有効になっている
- React Native で同様のことをしたい場合は AppState の active イベントにリスナーを登録する
- その他、詳細略

## Disabling / Pausing Queries

`enabled`オプションを`false`設定することで以下のようになる。

- キャッシュデータが存在する場合は、`status === 'success'`状態になり、かつ`data`が提供される
- キャッシュデータがない場合は`status === 'loading`かつ`fetchStatus === 'idle'`状態になる
- マウント時にクエリが実行されない
- バックグラウンドでリフェッチされない
- `invalidateQueries()`や`refetchQueries()`が発火されても再クエリしない
- `refetch()`を使って手動でクエリを実行することはできる

## Query Retries

queryFn の失敗時にはデフォルトで 3 回リトライする

## Pagenation

- 普通にページネーションしようとすると、切り替えのたびに`data`が空になったり`loading` state になることで、画面がガタつくなど UI としてよろしくない挙動になる。
- これを防ぐには`keepPreviousData`オプションを有効にする。
- このオプションが無効だと：
  - クエリ開始時には`status==='loading' && data === undefined`に毎回戻ってしまう
- このオプションが有効だと：
  - クエリ開始時には`status==='success' && data === <前回取得したデータのキャッシュ>`になる
    - 過去に少なくとも一度クエリが成功している前提
  - ユニークキーが変更されても、前回取得した`data`が利用可能
  - データ取得が成功した段階で`data`が差し替えられる
  - `isPreviousData`フラグが提供される
- [サンプルコード](https://tanstack.com/query/latest/docs/react/guides/paginated-queries)をそのままパクれば OK!

## Infinite Queries

略

## Initial Query Data

- 例えばローカルストレージにキャッシュしていたデータを初期データとして設定したい場合などを想定
- プレースホルダのような不完全なデータには後述の`placeholderData`を使う
- 詳細略

## Placeholder Query Data

- 例えばブログの個別ページを取得したい状況において、前もってその個別ページの一部分のデータを取得済みの場合に、データ取得が完了するまでの間、先んじて一部分のデータを画面に表示させたい場合などを想定
- UI 改善のために使用するもの。Optimistic Update とやや似ている。

## Prefetching

- ユーザが次に必要としそうなデータが予め分かっている場合に、そのデータを事前に取得しておくことで UI パフォーマンスを改善するためのもの
- `queryClient.prefetchQuery`を使う
- 詳細略

## Mutations

データを作成・更新・削除する場合は`useQuery`ではなく`useMutation`を使う。

```ts
const { status, isLoading, isError, isSuccess, mutate, error, data } =
  useMutation((newTodo) => axios.post('/todos', newTodo));

mutate({ id: 1234, title: 'hello' });
```

- `isIdle` or `status === 'idle'` アイドル状態、フレッシュな状態、リセットされた状態
- `isLoading` or `status === 'loading'` 通信中
- `isError` or `status === 'error'` エラー
  - `error` レスポンス
- `isSuccess` or `status === 'success'`
  - `data` レスポンス
- `reset` --- `error`や`data`をリセットする
- `mutate` Mutation を実行する。渡せる引数は 1 つ。サーバからのレスポンス等が返ってくる。

これだけならなんの変哲もないが、`onSuccess`, `invalidateQeries`や`setQueryData`と組み合わせることで強力になる。

### Mutation Side Effects

- mutation 時に Side Effects を実行できる
- mutation 後の invalidation, refetching や optimistic update に使用する
- `async`が使用できる

```ts
useMutation(addTodo, {
  onMutate: (variables) => {
    // mutationの直前に実行される

    // 任意のコンテキストを返すこともできる
    const context = { id: 1 };
    return context;
  },
  onError: (error, variables, context) => {
    console.log(`rolling back optimistic update with id ${context.id}`);
  },
  onSuccess: (data, variables, context) => {},
  onSettled: (data, error, variables, context) => {
    // 成功時・エラー時どちらでも実行される
  },
});
```

- `useMutation`だけでなく、`mutate`にも記載できる
- この場合、`useMutation`の後に実行される。

```ts
mutate(todo, { onSuccess, onError, onSettled });
```

### 複数の `mutate` を連続して実行するときの注意点

useMutation に渡した`onSuccess`等は毎回実行されるが、mutate には渡した`onSuccess`等は最後のものだけが実行される。詳細は[こちら](https://tanstack.com/query/latest/docs/react/guides/mutations#consecutive-mutations)。

### Promises

- `mutateAsync`を使えば Promise 形式で Side Effects を記載することもできる。
- これにより、サイドエフェクトを使って事後処理を組み立てること（Composition）が可能になる。

```ts
const mutation = useMutation({ mutationFn: addTodo });

const result = await mutation.mutateAsync(todo);
await someOtherSideEffect(result);
await someOtherSideEffect();
```

### Retry

mutation ではエラー時の再試行はデフォルトで無効化されている。必要なら`retry`オプションを指定する。

### Persist mutations

オフライン時に実行中の mutation を永続化しておき、復帰時に再実行することもできる。高度すぎるため省略。

## Query Invalidation

- mutation 後に、必要に応じてクエリを無効化する(Query Invalidation = キャッシュを古いものと認識させること)。
- クエリが無効化されると、キャッシュデータが強制的に`stale`になったうえでデータ再取得が行われる。

```ts
// Invalidate every query in the cache
queryClient.invalidateQueries();
// Invalidate every query with a key that starts with `todos`
queryClient.invalidateQueries('todos');
```

例えば redux などではデータを正規化して命令的に手動で管理していくスタイルが取られる。一方、react-query ではそういった手法を取る代わりに、的を絞ったキャッシュの Invalidation と、バックグラウンドリフェッチを組み合わせることにより、そもそもデータの正規化を行う必要性をなくした。

### どのクエリを無効化するか

先頭のキーが一致するものは全て無効化される

```ts
// キーが一つ
queryClient.invalidateQueries(['todos']);
// 両方とも無効化される
const todoListQuery = useQuery(['todos'], fetchTodoList);
const todoListQuery = useQuery(['todos', { page: 1 }], fetchTodoList);
```

```ts
// キーが二つ
queryClient.invalidateQueries(['todos', { type: 'done' }]);
// こっちは無効化される
const todoListQuery = useQuery(['todos', { type: 'done' }], fetchTodoList);
// こっちは無効化されない
const todoListQuery = useQuery(['todos'], fetchTodoList);
```

完全一致するものだけを無効化するには`exact`オプションを使う

```ts
queryClient.invalidateQueries(['todos'], { exact: true });
// 無効化される
const todoListQuery = useQuery(['todos'], fetchTodoList);
// 無効化されない
const todoListQuery = useQuery(['todos', { type: 'done' }], fetchTodoList);
```

もっと詳細なコントロールもできるけど省略

## Invalidation from Mutations

- 前項は Invalidation のやり方(How)の話
- 本項は Invalidation をいつ(When)やるのかという話
- mutation が成功したときは、まさにその時だよね

```ts
import { useMutation, useQueryClient } from 'react-query';

const queryClient = useQueryClient();

const mutation = useMutation(addTodo, {
  onSuccess: () => {
    queryClient.invalidateQueries('todos');
  },
});
```

## Mutation のレスポンスを使ってクエリを更新する

- 更新時のレスポンスを使ってクエリを更新すれば、ネットワークリソースを効率的に使用できる
- `queryClient.setQueryData`を使う

```ts
const queryClient = useQueryClient();

const mutation = useMutation(editTodo, {
  onSuccess: (data, variables) =>
    queryClient.setQueryData(['todo', { id: variables.id }], data),
});

mutation.mutate({
  id: 5,
  name: 'Do the laundry',
});

// 場合によっては上記をひっくるめてhook化しておくとよい。詳細略。
```

## 楽天的更新

略

## Query Cancellation

略

## Scroll Restoration

- スクロールポジションの復元については、React Query では特に心配する必要がない。
- なぜなら、データがキャッシュされている限り、再マウント時などでも同期的にデータが取得でき、前回と全く同じ通り画面が描写されるため。

## Filters

### Query Filters

- `cancelQueries`, `removeQueries`, `refetchQueries`などにを実行する際に、どのクエリを対象にするかを指定するために使う
- 指定できるキーは以下の通り。
  - `queryKey`
  - `exact`
  - `type`
    - `all`, `active`,`inactive`のいずれか
  - `stale`
  - `fetchStatus`
  - `predicate`
    - 手動で詳細にフィルタしたい時に使う

```ts
// 全てのクエリ（Query Filters指定しないパターン）
await queryClient.cancelQueries();

// 全ての非アクティブなクエリ
queryClient.removeQueries({ queryKey: ['posts'], type: 'inactive' });

// 全てのアクティブなクエリ
await queryClient.refetchQueries({ type: 'active' });

// `post`で始まる全てのクエリ
await queryClient.refetchQueries({ queryKey: ['posts'], type: 'active' });
```

### Mutation Filters

- `queryClient.isMutating()`などにを実行する際に、どの Mutation を対象にするかを指定するために使う
- 指定できるキーは以下の通り。
  - `mutationKey`
  - `exact`
  - `fetching`
  - `predicate`
    - 手動で詳細にフィルタしたい時に使う

## SSR & Next.js

略

## Caching

略

## Default Query Function

もしアプリ全体で同じクエリ関数を使いたい場合には、デフォルトクエリ関数を設定しておくことで実現できる。

```tsx
// デフォルトクエリ関数を作る
const defaultQueryFn = async ({ queryKey }) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com${queryKey[0]}`
  );
  return data;
};

// クライアント作成時にデフォルトクエリ関数をセットしておく
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}

// 使用するときはキーだけ渡せばOK
function Posts() {
  const { status, data, error, isFetching } = useQuery('/posts');
  // ...
}

// なお、デフォルトクエリ関数がセットされている場合は、第二引数にクエリ関数ではなくオプションを記載できる
function Post({ postId }) {
  const { status, data, error, isFetching } = useQuery(`/posts/${postId}`, {
    enabled: !!postId,
  });
  // ...
}
```

## Suspense

実験的なモードです

## Testing

略
