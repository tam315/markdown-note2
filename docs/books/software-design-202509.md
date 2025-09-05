# Software Design 202509

## ドメイン解体新書 / Public Suffix List

**eTLD（Effective Top-Level Domain）**は、.comや.co.jpのように、
一般的に個人や組織が直接登録することができないドメインの部分を指す。

ブラウザは、eTLDに対してセキュリティポリシーを適用することはない。
ポリシーとは、例えばSameSiteの判定（「このドメインに属するサブドメインは全て同一オリジンとして扱う」）などだ。

一方、`eTLD+1`は「レジストラブルドメイン」と呼ばれ、これがブラウザのセキュリティポリシーを適用する最小単位となる。
例えば、my-company.comやmy-company.co.jpなどがeTLD+1に該当する。

どの部分がeTLDなのかを判断するための基準が Public Suffix List (PSL) である。
これは、ドメインを客に払い出すサービスなどをしている場合に特に重要となる。
Cookieの共有範囲制御や、ワイルドカードSSL証明書の管理などに影響するからだ。

2025/9時点で15,000行強、300KB程度あるので、ブラウザにハードコードされたりキャッシュされたりしている。
以下のGitHubで管理されている。
[https://github.com/publicsuffix/list](https://github.com/publicsuffix/list)

- `example.com`と書くと、example.comがeTLDになる。
- `*.example.com`と書くと、以下の全てがeTLDになる
  - test1.example.com
  - test2.example.com
  - ....(その他すべて)
- `!www.example.com`と書くと、www.example.comだけをeTLDから除外する。
  結果として何がeTLDになるかは他の行の設定に依存する。

## つまみぐい関数型プログラミング / 高階関数

**高階関数 / Higher-order function** とは、関数を受け取ったり返したりする関数のこと。
関数がファーストクラスオブジェクトである(値と同じ用に扱える)場合に使える。
関数は値から値への変換を行う。その「値」に「関数」も含まれているということ。

**関数を受け取る関数**には、filter, map, reduceなどがある。
複雑な処理を複数の単純な関数に分けられるため、
入れ替えや変更の容易性、再利用性が高くなる。

**関数を返す関数(カリー化+部分適用)** を使うと、あらかじめ設定を焼き込んだ関数を生成できる。
主に Dependency Injection や、処理のバリエーションを簡素に表現するために使う。
