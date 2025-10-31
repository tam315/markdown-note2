# Dependency Injection Principles, Practices, and Patterns

なぜ依存性を注入するのか 〜DIの原理・原則とパターン〜

## 1. 依存注入(Dependency Injection :DI)の基本

DIとは、様々なソフトウェア設計の原則やパターンを集めたもの。
DIの目的は、コードを疎結合にすることで、**保守容易性**を高めること。

DIの文脈では、抽象のことを「サービス」、実装のことを「コンポーネント」ということがある。

### 保守容易性

以下はDIに対してよくある誤解なので、完全に忘れること。

- DIは遅延バインディング(インターフェースだけを定義して、実装は実行時に選択する)にしか使えない
- DIは単体テストにしか使えない
  - それらはDIの用途のごく一部にすぎない
- Abstract Factory パターンと似たものである
  - これはService Locatorといい、命令的に依存を呼び出して利用するもの
  - 依存を必要とするクラスがあるときに、その利用者に対して提供義務を課すのがDIなので、むしろ対極といえる
- DIするにはDIコンテナが必要である
  - DIコンテナはあくまで任意であり、例えばPure DIという方法もある
  - なお、DIコンテナを Service Locator として使うのは完全な間違い

DIとの関係でよく出てくる4パターン

- Decorator パターン
  - 機能追加や横断的関心を、既存コードを変えることなく実装するためのパターン
  - 実装はちょっと違うけと同じインターフェースを返すラッパー関数みたいなイメージ？
  - e.g. コンセントと機器の間にUPSを入れる
- Composite パターン
  - 既存の実装クラスとは別の実装クラスを追加してリファクタリングするためのパターン
  - e.g. 電源タップを使って複数の機器を使う
- Adapter パターン
  - 微妙に異なる2つのインターフェースを組み合わせてつけるようにするためのパターン
  - e.g. 海外で形の違うコンセントにアダプタを使う
- Nullオブジェクト
  - サービスが利用不可能でもエラーにならないようにするためのパターン
  - e.g. 使わないコンセントにダミーのキャップをはめておく

**リスコフの置換原則**とは、将来起きうる未知の変更に対応するための考え方。
インターフェースの実装はほかの実装に取り替え可能であるべきという原則。

**開放閉鎖の原則(Open/Closed Principle: OCP)**とは、
既存のコードを変更することなく機能追加を可能にするための考え方。
拡張はできるけど変更はできないようにする原則。

DIの本質とは、コンセントと家電の例のように、**基準を定めて疎結合にする**ことで、
既存コードに手を入れることもなく、将来の想定外の変化に応えられるようにすること。

疎結合にする簡単な方法は**インターフェースに対してプログラミングをする**ということ。
インターフェースはnewできないので、どこでオブジェクトを生成するか、という問いが生まれる。
その問いを解決するのが、DIである。

### サンプル・アプリケーション

DIを実現する方法の一つに、コンストラクタ経由でのDI(Constructor Injection)がある。
必要とする依存を、コンストラクタの引数にインターフェースとして静的に定義する方法。

以下はPure DIの例。

```ts
// 依存するインターフェース（抽象）
interface Logger {
  log(message: string): void
}

// Loggerの具体的な実装
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[LOG] ${message}`)
  }
}

// UserServiceクラスは、コンストラクタでLoggerを受け取る
class UserService {
  // コンストラクタで依存を注入
  constructor(private logger: Logger) {}

  createUser(name: string): void {
    // ユーザー作成処理
    this.logger.log(`ユーザー「${name}」を作成しました`)
  }

  deleteUser(name: string): void {
    // ユーザー削除処理
    this.logger.log(`ユーザー「${name}」を削除しました`)
  }
}

// 使用例
const logger = new ConsoleLogger()
const userService = new UserService(logger) // コンストラクタ経由で依存を注入

userService.createUser('太郎')
userService.deleteUser('次郎')
```

じゃあなぜ、1行で書けるものをこんなに大量のコードにする必要がある？
言い換えると疎結合(DI)のメリットとは？

- **遅延バインディング** / Late binding
  - JSONなどの設定ファイルによって挙動を制御できるようになる
- **拡張容易性** / Extensibility
  - 抽象を使ってコードを書くと、できることが規定&制限され、自然と変更に対してClosedになる
  - 実装にはDecoratorパターンにより、あとから機能を追加できるので、拡張に対してOpenになる
- **並列開発** / Parallel development
  - 抽象が唯一の契約となり、複数チームでの開発が容易になる
- **保守容易性** / Maintainability
- **テスト容易性** / Testability
