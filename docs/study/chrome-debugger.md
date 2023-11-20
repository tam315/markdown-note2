# Chrome Debugger

## Breakpoint

### ショートカット

- Cmd + `\` - 次の Break Point へ
- Cmd + `'` - 次のステップへ移動 / 同一階層で
- Cmd + (Shift +) `;` - 次のステップへ移動 / (この関数の中に入ったうえで | この関数から出たうえで)

### 通常の Breakpoint

- 指定した地点で処理を止める

### Conditional Breakpoint

- 指定した地点で処理を止める
  - ただし、指定した条件式が成立するのみ場合のみ
  - 条件式に複数の値をカンマ区切りで入力すると、停止させるかどうかの判定は最後の値により行われる
- Hacky な使い道
  - トレース
    - `console.trase('hoge')`と条件式に入れる
    - `debugger`でも同じものは見れるが、複数回の呼び出しを一気に記録・確認したい場合に便利かも
  - 値の一時的な上書き
    - `someValue = 1234, false`と条件式に入れる
    - こうすると、任意の値を書き換えたうえで処理は継続される
  - パフォーマンス計測
    - `console.time('hoge')` & `console.timeEnd('hoge')`と条件式に入れる
    - 簡易的なパフォーマンス計測ができる
  - ページが読み込まれたあとだけ発動する Breakpoint
    - `performance.now() > 5000`と条件式に入れる
  - いまから 5 秒後以降にのみ発動する Breakpoint
    - `window.baseline = window.baseline || Date.now(), (Date.now() - window.baseline) > 5000`と条件式に入れる
    - `window.baseline = Date.now()`とすれば、いつでもリセットできる

### Logpoint

- 指定した地点における、指定した変数の値をコンソールに出力できる
- `console.log` をわざわざ書かなくていいいので便利

## Watch

- Breakpoint における、指定した変数の値を Debugger -> Sources 画面の右ペインに常に出力できる
- 指定した変数がスコープ内にない場合は`<not available>`と表示される
