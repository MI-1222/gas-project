# Cloudflare ログ取得スクリプト (`src/app/cloudflareLog`)

Cloudflare GraphQL Analytics API から日次のログ・メトリクスを取得し、Google スプレッドシートへ記録する Google Apps Script (GAS) アプリケーションです。

## 現在の実行設定

本番環境では以下の設定で自動実行することを想定しています。

- 実行する関数: `main`
- トリガー種別: `時間主導型` (日付ベースのタイマー)
- 実行時刻: 毎日 `午前2時〜3時`

## 必要な環境変数

ビルド時に `.env` (または `.env.dev` / `.env.prod`) から `process.env.*` へ埋め込まれます。`.env.example` を参考に以下を設定してください。

- `CLOUDFLARE_READ_API_TOKEN`: Cloudflare API トークン (読み取り権限)
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare アカウント ID (`accounts` スコープのタスクで使用)
- `CLOUDFLARE_ZONE_TAG`: Cloudflare ゾーンタグ (`zones` スコープのタスクで使用)
- `CLOUDFLARE_WORKER_NAMES`: 対象とする Worker 名のカンマ区切りリスト (任意。未設定・空文字の場合は全 Worker を対象)

## ファイル構成

- `src/app/cloudflareLog/index.ts`: エントリーポイント (`main`)。各レポートタスクを順次実行し、スプレッドシートへの新規作成・追記を行う
- `src/app/cloudflareLog/config.ts`: 実行したいレポートタスク定義 (`reportTasks`)
- `src/app/cloudflareLog/dataProcessor.ts`: API レスポンス JSON をスプレッドシート書き込み用の二次元配列へ変換する (`jsonToSheetData`)
- `src/models/CloudflareClient.ts`: Cloudflare GraphQL Analytics API のクエリ構築および通信クライアント
- `src/utils/jstDate.ts`: JST 基準の日付範囲計算およびタイムスタンプ文字列フォーマット
- `src/utils/objectPath.ts`: ドット区切りパスによる安全なネストプロパティ取得
- `src/types/cloudflare.ts`: Cloudflare タスク設定・API レスポンス等の型定義

## ビルドとテスト

```bash
# ユニットテストの実行
pnpm test

# ビルド (dist/cloudflareLog.js を生成)
pnpm run build
```
