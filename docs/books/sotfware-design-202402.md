# Software Design 202402

## テストの設計

### テストとは

テストは 4 つの段階からなる。

- 分析 / 何をテストするか決める
- 設計 / どのようにテストするか決める
- 実装 / 実行に必要なものを準備する
- 実行 / テストスイートを実行する

テストの対象にはコードだけではなく、コードを書く前段階で扱う仕様や要件も含まれる。分析の段階でのテスト対象がまさにそれである。

テストには検証と妥当性確認の 2 つがある。

**検証**とは、要件を満たしているかどうかの確認であり、「どのようにテストを実装すればいいか」を考える行為といえる。(e.g. パスワードが 4 文字以上である)

**妥当性確認**とは、ニーズを満たしているのかどうかの確認である(e.g. パスワードの文字列長が妥当である)。ニーズには、要件として明文化はされていない幅広い事柄が含まれる。「どのようなテストを行えばいいのか」を考える行為といえ、**テスト分析**と呼ぶ。仕様書や設計書のレビュー行為に近いものの「もしテストするなら」の視点で行う点が異なる。

早い段階でテストの考えを注入することを**シフトレフトテスト**という。より早い段階で誤りに気がつくことができれば、コストを指数関数的に下げることができる。

### テスト技法

テスト技法には大きく 3 つの種類がある。

- ブラックボックステスト
- ホワイトボックステスト
- 経験ベースのテスト

#### ブラックボックステスト

**同値分割法**とは、結果的に同じ振る舞いをするはずの入力値をグループ化し、そのグループの中から 1 つずつ任意の値を選んでテストする手法である。このグループのことを**同値パーテーション**と呼ぶ。有効な値だけでなく無効な値も含めてテストすることが重要。

**境界値分析**とは、同値分割法の拡張版であり、境界値周辺をより詳細にテストする方法である。境界値ごとに 2 つもしくは 3 つのテストケースを作成するため、同値分割法よりもテストケースは増える。

**デシジョンテーブルテスト**とは、複数の条件とその結果を表にまとめ、その表からテストケースを作成する方法である。テーブルは条件記述分、動作記述分、条件指定部、動作指定部の 4 つの部分から構成される。条件記述部には`Y/N/-(動作に影響しない)`などを書く。各列がテストケースとなる。

**状態遷移テスト**とは、システムの状態遷移をテストする手法である。状態遷移図を作成し、その図からテストケースを作成する。有効な遷移だけをテストするパターン、無効な遷移を含めてテストするパターン、間に N 個の状態を経由する全ての遷移をテストするパターンの 3 つのパターンがあり、要件に応じて選択する。

**ペアワイズテスト**とは、複数の入力値の組み合わせをテストする手法である。全ての組み合わせをテストすると膨大な数のテストケースが必要になる場合に最適。

#### ホワイトボックステスト

**ステートメントテスト**とは、プログラムの各ステートメントを 1 回以上実行するテストケースを作成する手法である。ステートメントを網羅したとしても、全てのケースを網羅しているとは限らないので注意。

**ブランチテスト**とは、プログラムの分岐を網羅するテストケースを作成する手法である。分岐を網羅するためには、真と偽の両方のケースをテストする必要がある。全てのケースをカバーできる。