# Software Design 202310

## Go 言語のエラー処理 (後編)

- カスタムエラー構造体の命名
  - XxxError という名前にするのが Go の慣習

```go
type XxxError struct {
    Msg string
    File string
    Line int
}

func (e *XxxError) Error() string {
    return fmt.Sprintf("%s:%d: %s", e.File, e.Line, e.Msg)
}
```

- 事前定義エラー変数の命名
  - ErrXxx という名前にするのが Go の慣習
  - エラー文字列
    - 原則小文字で書く
    - 句読点は入れない
    - パッケージ名を入れておくとよい

```go
// errors.New()はシンプルに文字列からエラー変数を生成するときに使える便利な関数
var ErrNotFound = errors.New("not found")
```

- 値とエラーを混ぜない
  - Go は多値返却が可能なので、処理結果とエラーを同一の変数で返す必要性がない
- nil と型あり nil を使い分ける
  - `err != nil` で判定したときに、型あり nil は常に`true`となってしまう
  - Go 初学者がやりがちなミス

```go
// 明示的なnil
return nil

// 型ありnil
var e *MyError = nil
return e
```

- defer 文の中で発生したエラーの扱い方
  - 以下の 2 つの組み合わせでうまく処理できる(詳細は本文参照)
    - 名前付き戻り値の仕組みを使う
    - 本筋の処理で発生したエラーが、defer 文内で発生したエラーで上書きされないよう、`errors.Join()`を使ってエラーのマージ等を行う
- エラーのラップと判定
  - エラー A の原因となったエラー B という因果関係を表現するために、`Unwrap()`メソッドによるエラーのラップを行う場合がある
  - `errors.Is()`
    - ラップされたエラーを`Unwrap`し続けると、最終的に判定対象のエラーと同じ型に到達するかどうかを判定する
  - `errors.As()`
    - `error.Is()`と同等の判定を行うのに加え、マッチした場合にはその値を取り出すことができる
