# GAS関数について (`docs/gas_function.md`)

## Node.js標準の機能を使う場合について

Node.js標準の機能(e.g. `crypto`, `fs`, ...)を用いている場合、
`ReferenceError`, `not supported`などの旨のエラーが発生する可能性があります。
(`node_modules`のライブラリが内部で用いている場合も多々ある。)

そのようなコードを実行したい場合、GAS標準の機能を用いて代替実装する手段をまずは試して下さい。
型定義は`@types/google-apps-script`にインストールされています。

コーディングサポートのエージェントが参照したい場合は、

```sh
ls -R node_modules/@types/google-apps-script
```

によって目的の型定義ファイルを推定し、

```sh
# 例 GAS標準の機能の`Utilities.getUuid();`について知りたい場合
cat node_modules/@types/google-apps-script/google-apps-script.utilities.d.ts
```

のように参照してください。

## 環境変数の参照について

GASでは、環境変数のようなものの設定として、`スクリプトプロパティ`というものがありますが、
`gs`ファイルに含めても、GASエディタの設定画面から設定しても、GASエディタにアクセスできる時点でセキュリティとしては変わらないので、
`npm run build`により生成される`dist/`内のファイルに埋め込まれるようにしました。
(ローカルからスクリプトプロパティを編集するのは面倒であるため。)

環境変数をソースコード内で参照する場合は、
**`import dotenv from "dotenv";`, `dotenv.config();`を使わずに**
`process.env.API_TOKEN`のように参照してください。
`@rollup/plugin-replace`により、`dist/`内のファイルに直接埋め込まれるようにしています。
(`import dotenv from "dotenv";`などを使うと、`@rollup/plugin-node-resolve`が`dotenv`の依存関係を解決しようとし、無駄に出力ファイルが長くなる。多分エラーも起きる。)

## `"target": "es2019"`について

`tsconfig.json`にて、`"target": "esnext"`のように設定すると、
出力のgsファイルにGASのランタイムが解釈できない構文が含まれる可能性があるので、
`"target": "es2019"`と設定している。

(例: classのプロパティの構文)
