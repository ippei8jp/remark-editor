#### Electron勉強用

##### 概要

`Electron`を使ったプログラムを勉強するのに、[ここ](https://qiita.com/yasumichi/items/fc594e9ef1d7096bd56a) の内容をトレースしてみた。

そのままトレースするだけでは意味ないので、以下の変更を行った。

- `Electron`を作業時の最新版(`v5.0.2`)に変更
- パッケージ化を`electron-builder`に変更
- ディレクトリ構成を`src`ディレクトリに分離
- インストール作業の簡便化


##### プログラム実行

ソースの取得

```bash
git clone https://github.com/ippei8jp/remark_editon
cd remark_edeitor
```

必要なモジュールのインストール
実行側の必要なモジュールもこのなかで自動的にインストールされる

```bash
npm install
```

とりあえず表示してみる。
パッケージ化しないのでデバッグとかやるとき用かな。

```bash
rpm start
```

パッケージ化
```bash
npm run build
```

で、ちょっと待つと完成するハズ

ポータブル版実行ファイル `dist/remark-ed 0.0.0.exe`  ができる(ファイル名には`src/package.json` の`name`が反映されるようだ)。
このファイル1つを別のマシンにコピーすれば実行できる。
ただし、このファイルはテンポラリにファイルを展開してから実行するみたいで、起動に時間がかかる。

`dist/win-unpacked/remark-ed.exe` が実行プログラム本体なので、これを実行すると起動は早い。

`dist/win-unpacked`ディレクトリをまとめてコピーすれば、別のマシンにコピーすれば実行できる。

