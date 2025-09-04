# Software Design 202509

## ドメイン解体新書 / Public Suffix List

eTDLは`.com`とか`.co.jp`とか。
eTDL+1をレジストラブルドメインという。
ブラウザがセキュリティポリシーを適用する最小単位である。

どの部分がeTDLなのかを判断するための基準が Public Suffix List (PSL) である。
300KB程度あるので、ブラウザにハードコードされたりキャッシュされたりしている。
PSLはドメインを客に払い出すサービスなどをしている場合に特に重要である。

```
example.com // example.comがeTLD
*.example.com // test1.example.comやtest2.example.comなどがすべてeTLD
!www.example.com // www.example.comだけを除外する。結果として何がeTDLになるかは他の行の設定に依存する。
```

PSLはCookieの共有範囲制御、ワイルドカードSSL証明書の管理などに影響する。
