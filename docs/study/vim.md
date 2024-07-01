# Vim

## 必須

操作 x 中身だけか全体か x 範囲

- 操作
  - `c`: change
  - `y`: yank
  - `d`: delete
- 中身だけか全体か
  - `a`: an object
  - `i`: inner object
- 範囲
  - `w`: word
  - `s`: sentence
  - `p`: paragraph
  - 各種囲み記号(parenthesis, bracket, brace...)

## 移動

- `hjkl`: 左、下、上、右 (`g`をつければスクリーン上)
- `wbe`: 単語の先頭、末尾、単語の先頭へ
- `$`: 行末へ
- `0`: 行頭へ
- `^`: 行頭の非空白文字へ
- `%`: 対応する括弧へ
- `Shift + {}`: ブロック移動
- `Ctrl + o` 戻る

## ページ送り

- `Ctrl + fbudey`: スクロール
- `zz, zt, zb`: カーソル位置を中央、上、下に

## 挿入

- `aA`: カーソルの後ろ、行末へ
- `iI`: カーソルの前、行頭へ
- `oO`: 下、上に行を挿入

## 検索置き換え

- `/ or ?`: 検索
- `nN`: 次、前の検索結果へ
- `:%s/old/new/g`: 置換

## 編集

- `(g)J`: 行を結合
- `>>, <<`: インデント
- `Ctrl + t, d`: インデント

## マーク

- `m{a-z}`: マーク
- `'{a-z}`: マークの行へ移動
- ``{a-z}`: マークへ移動

## 支援

- `gd`: goto definition
- `gh`: goto help
