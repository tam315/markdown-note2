# ESM / CJS 関連

## CJS / CommonJS modules

- Node.js で使える

```js
// 提供側
exports.foo = 0;

// 利用側
require('foo');
```

## ESM / ECMAScript Modules

- Node.js、ブラウザで使える

```js
// 提供側
export const foo = 0;

// 利用側
import { foo } from 'foo';
```

## faux ESM

- バンドラーが解釈できる ESM ライクなもの
- 例えば ESM の中には本来は require は書けないが、faux ESM では書ける（よしなに解釈される）
- 混乱の元

```js
import path from 'path';
// 書けちゃう、動いちゃう
const fs = require('fs');
```

## package.json のエントリーポイント

- main
  - ESM か CJS かの判定は以下で行う
    - 指しているファイルの拡張子
    - そのファイルの近くの package.json の type フィールド
  - Node.js で使える
    - この際、`exports` フィールドが存在すればそちらが優先
  - バンドラーでも使える
    - この際、後述するほかのフィールドが存在すればそれらが優先
- module / jsnext / jsnext:main
  - ESM 用のエントリーポイント
  - 非標準
  - バンドラーで使える
  - Node.js では使えない(バンドルしない限り)
- browser
  - なんでもありのよくわからんフィールド
- exports
  - 最新
  - conditional exports が使える

モジュールで分ける例

```json
{
  "exports": {
    ".": {
      "require": "./index.cjs.cjs",
      "import": "./index.esm.mjs"
    }
  }
}
```

実行環境によって分けることも可

```json
{
  "exports": {
    ".": {
      "deno": "./index.deno.js",
      "browser": "./index.browser.js",
      "node": "./index.node.js"
    }
  }
}
```

あるいはその両方も可

```json
{
  "exports": {
    ".": {
      "browser": {
        "require": "./index.browser.cjs.cjs",
        "import": "./index.browser.esm.mjs"
      },
      "node": {
        "require": "./index.node.cjs.cjs",
        "import": "./index.node.esm.mjs"
      }
    }
  }
}
```
