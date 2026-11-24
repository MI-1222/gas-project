/**
 * Cloudflare GraphQL Analytics APIのスコープ種別。
 */
export type CloudflareScope = "accounts" | "zones";

/**
 * Cloudflare GraphQLクエリ内の集計タイプ。
 */
export type CloudflareMetricAggregation = "sum" | "quantiles" | "top";

/**
 * Cloudflare GraphQL APIリクエスト設定。
 */
export interface CloudflareApiSettings {
  /**
   * 取得対象スコープ（アカウント単位またはゾーン単位）。
   */
  scope: CloudflareScope;
  /**
   * 取得するデータセット名。
   */
  dataset: string;
  /**
   * 取得したいメトリクス名の配列（`表示名:APIフィールド名` 形式も可）。
   */
  metrics: string[];
  /**
   * データの集計軸となるディメンション名の配列。
   */
  dimensions: string[];
  /**
   * 取得データの絞り込み条件。
   */
  filters: Record<string, unknown>;
  /**
   * 並び替え指定（nullを指定するとorderBy句を省略）。
   */
  orderBy?: null;
}

/**
 * レポートタスク定義。
 */
export interface CloudflareReportTask {
  /**
   * タスク識別名（ログ出力に使用）。
   */
  taskName: string;
  /**
   * 書き込み先のスプレッドシートのシート名。
   */
  outputFile: string;
  /**
   * Cloudflare APIリクエスト設定。
   */
  apiSettings: CloudflareApiSettings;
  /**
   * スプレッドシートのヘッダー行定義。
   */
  spreadsheetHeaders: string[];
}

/**
 * APIリクエスト用の日時範囲（UTC ISO 8601形式）。
 */
export interface CloudflareTimeRange {
  startDate: string;
  endDate: string;
}

/**
 * Cloudflare GraphQL APIのエラー要素。
 */
export interface CloudflareGraphQLError {
  message: string;
  [key: string]: unknown;
}

/**
 * Cloudflare GraphQL APIレスポンスの型。
 */
export interface CloudflareGraphQLResponse {
  data?: {
    viewer?: {
      accounts?: Array<Record<string, unknown[]>>;
      zones?: Array<Record<string, unknown[]>>;
    };
  };
  errors?: CloudflareGraphQLError[];
}

/**
 * CloudflareClientの初期化設定。
 */
export interface CloudflareClientConfig {
  /**
   * Cloudflare APIトークン（読み取り権限）。
   */
  apiToken: string;
  /**
   * CloudflareアカウントID（accountsスコープ利用時に必須）。
   */
  accountId?: string;
  /**
   * Cloudflareゾーンタグ（zonesスコープ利用時に必須）。
   */
  zoneTag?: string;
}
