# Software Design 202503

## ドメイン解体新書

ダングリングレコードとは、存在しないリソースを指すDNSレコードのこと。
A,CNAME,MX,NAME等の参照先を乗っ取られることで、第三者にドメインを乗っ取られる攻撃をうける可能性がを生む。
不要になったDNSの設定を放置していることで発生しがちなので、サービス終了時などにきちんと始末しておくこと。
