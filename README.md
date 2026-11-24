# gas-project

本プロジェクトは、Google Apps Script(GAS)を使用して作成されたGoogle WorkspaceのWebアプリケーションです。
typescriptとrollupを使用して、GASのコードをコンパイルしています。
`@types/google-apps-script`を利用し、GASの関数などに補完が効くようにしています。

`npm run build`により、`dist/`に各プロジェクト名のJavaScriptファイル(内容は`.gs`)が生成されます。

## ドキュメント

- `docs/structure.md` : プロジェクト構造
- `docs/gas_function.md` : GAS関数を使う場合の注意事項
  - Node.js標準の機能を使う場合についての説明
  - 環境変数の取り扱い
  - `"target": "es2019"`について
- `docs/limit.md` : GASの制限事項
- `docs/mail_query.md` : Gmailクエリ
