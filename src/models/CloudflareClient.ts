import type {
  CloudflareClientConfig,
  CloudflareGraphQLResponse,
  CloudflareMetricAggregation,
  CloudflareReportTask,
  CloudflareTimeRange,
} from "../types/cloudflare";

const CLOUDFLARE_GRAPHQL_ENDPOINT =
  "https://api.cloudflare.com/client/v4/graphql";
const MAX_RESULTS_LIMIT = 10000;

/**
 * メトリクス名とGraphQLクエリ内での集計タイプ（sum, quantiles, top）の対応表。
 */
export const METRIC_MAP: Record<string, CloudflareMetricAggregation> = {
  // Workerパフォーマンス関連
  requests: "sum",
  subrequests: "sum",
  errors: "sum",
  cpuTimeP50: "quantiles",
  cpuTimeP90: "quantiles",
  cpuTimeP99: "quantiles",
  wallTimeP50: "quantiles",
  wallTimeP90: "quantiles",
  wallTimeP99: "quantiles",

  // サイトトラフィック・キャッシュ・ボット関連
  count: "top",
  edgeResponseBytes: "sum",
  "pageViews:visits": "sum",
  visits: "sum",

  // RUM - Core Web Vitals
  lcpP75: "quantiles",
  fcpP75: "quantiles",
  clsP75: "quantiles",

  // RUM - Page Load Timing
  pageLoadTimeP50: "quantiles",
  dnsDurationP50: "quantiles",
  tcpDurationP50: "quantiles",
  requestDurationP50: "quantiles",
  responseDurationP50: "quantiles",
  processingDurationP50: "quantiles",
};

/**
 * 文字列の先頭文字を大文字に変換する。
 * @param value 対象文字列。
 * @returns 先頭が大文字に変換された文字列。
 */
function capitalize(value: string): string {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Cloudflare GraphQL Analytics APIの通信を担当するクライアントクラス。
 */
export class CloudflareClient {
  private readonly apiToken: string;
  private readonly accountId: string | undefined;
  private readonly zoneTag: string | undefined;

  /**
   * @param config Cloudflare API接続設定。
   */
  constructor(config: CloudflareClientConfig) {
    if (!config.apiToken) {
      throw new Error("CLOUDFLARE_READ_API_TOKEN が設定されていません。");
    }
    this.apiToken = config.apiToken;
    this.accountId = config.accountId;
    this.zoneTag = config.zoneTag;
  }

  /**
   * レポートタスク設定に基づき、GraphQLクエリ文字列を動的に構築する。
   * @param task 単一のレポートタスク設定。
   * @returns 実行準備が整ったGraphQLクエリ文字列。
   */
  public buildGraphQLQuery(task: CloudflareReportTask): string {
    const { dataset, metrics, dimensions, orderBy, scope } = task.apiSettings;

    const primaryDimension = dimensions[0];
    const orderByClause =
      orderBy === null || !primaryDimension
        ? ""
        : `, orderBy: [${primaryDimension}_ASC]`;

    const topFields = metrics
      .filter((metric) => METRIC_MAP[metric] === "top")
      .join("\n              ");

    const sumFields = metrics
      .map((metric) => metric.split(":")[1] || metric)
      .filter((metric) => METRIC_MAP[metric] === "sum")
      .join("\n          ");

    const quantilesFields = metrics
      .filter((metric) => METRIC_MAP[metric] === "quantiles")
      .join("\n          ");

    const queryParts: string[] = [];
    if (sumFields) {
      queryParts.push(`sum { ${sumFields} }`);
    }
    if (quantilesFields) {
      queryParts.push(`quantiles { ${quantilesFields} }`);
    }

    const dimensionsString = dimensions.join("\n            ");

    if (scope === "accounts") {
      return `
      query GetAccountAnalytics($accountTag: string!, $filter: Account${capitalize(dataset)}Filter_InputObject) {
        viewer {
          accounts(filter: {accountTag: $accountTag}) {
            ${dataset}(filter: $filter, limit: ${MAX_RESULTS_LIMIT}${orderByClause}) {
              dimensions {
                ${dimensionsString}
              }
              ${topFields}
              ${queryParts.join("\n              ")}
            }
          }
        }
      }
    `;
    }

    if (scope === "zones") {
      return `
      query GetZoneAnalytics($zoneTag: string!, $filter: Zone${capitalize(dataset)}Filter_InputObject) {
        viewer {
          zones(filter: {zoneTag: $zoneTag}) {
            ${dataset}(filter: $filter, limit: ${MAX_RESULTS_LIMIT}${orderByClause}) {
              dimensions {
                ${dimensionsString}
              }
              ${topFields}
              ${queryParts.join("\n              ")}
            }
          }
        }
      }
    `;
    }

    throw new Error(`Unsupported scope: ${String(scope)}`);
  }

  /**
   * Cloudflare GraphQL Analytics APIにリクエストを送信し、ログデータを取得する。
   * @param task 実行対象のレポートタスク設定。
   * @param timeRange データ収集期間（UTC ISO 8601形式）。
   * @returns APIから返されたJSONレスポンスデータ。
   */
  public fetchLogs(
    task: CloudflareReportTask,
    timeRange: CloudflareTimeRange,
  ): CloudflareGraphQLResponse {
    const { startDate, endDate } = timeRange;
    const query = this.buildGraphQLQuery(task);

    const variables: Record<string, unknown> = {
      filter: {
        datetime_geq: startDate,
        datetime_leq: endDate,
        ...task.apiSettings.filters,
      },
    };

    if (task.apiSettings.scope === "accounts") {
      if (!this.accountId) {
        throw new Error(
          `タスク '${task.taskName}' には環境変数 CLOUDFLARE_ACCOUNT_ID が必要です。`,
        );
      }
      variables.accountTag = this.accountId;
    } else if (task.apiSettings.scope === "zones") {
      if (!this.zoneTag) {
        throw new Error(
          `タスク '${task.taskName}' には環境変数 CLOUDFLARE_ZONE_TAG が必要です。`,
        );
      }
      variables.zoneTag = this.zoneTag;
    }

    Logger.log(`[INFO] タスク '${task.taskName}' のデータを取得します...`);
    Logger.log(`[INFO] 期間: ${startDate} から ${endDate} まで`);

    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
      payload: JSON.stringify({ query, variables }),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(CLOUDFLARE_GRAPHQL_ENDPOINT, options);
    const responseCode = response.getResponseCode();
    const responseBodyText = response.getContentText();
    const responseBody = JSON.parse(
      responseBodyText,
    ) as CloudflareGraphQLResponse;

    if (responseCode < 200 || responseCode >= 300) {
      const errorDetails = responseBody.errors
        ? JSON.stringify(responseBody.errors, null, 2)
        : `Status: ${responseCode}, Body: ${responseBodyText}`;
      throw new Error(
        `APIリクエストに失敗しました (タスク: ${task.taskName}): ${errorDetails}`,
      );
    }

    if (responseBody.errors) {
      throw new Error(
        `GraphQLクエリがエラーを返しました (タスク: ${task.taskName}): ${JSON.stringify(responseBody.errors, null, 2)}`,
      );
    }

    const scopeKey = task.apiSettings.scope;
    const datasetKey = task.apiSettings.dataset;
    const results = responseBody.data?.viewer?.[scopeKey]?.[0]?.[datasetKey];

    if (results && results.length >= MAX_RESULTS_LIMIT) {
      Logger.log(
        `[WARNING] タスク '${task.taskName}' で${MAX_RESULTS_LIMIT}件の結果が返されました。これはリクエストごとの上限です。データが切り捨てられている可能性があります。取得期間を短くするなどの対応を検討してください。`,
      );
    }

    return responseBody;
  }
}
