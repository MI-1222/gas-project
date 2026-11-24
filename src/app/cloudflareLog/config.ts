import type { CloudflareReportTask } from "../../types/cloudflare";

/**
 * カンマ区切りのWorker名文字列を配列にパースする。
 * @param rawValue カンマ区切りのWorker名文字列。
 * @returns トリム済みのWorker名配列。
 */
export function parseWorkerNames(rawValue?: string): string[] {
  if (!rawValue) {
    return [];
  }
  return rawValue
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

const rawWorkerNames =
  typeof process !== "undefined" ? process.env.CLOUDFLARE_WORKER_NAMES : "";
const workerNames = parseWorkerNames(rawWorkerNames);
const workerFilters: Record<string, unknown> =
  workerNames.length > 0 ? { scriptName_in: workerNames } : {};

/**
 * 実行対象のレポートタスク定義一覧。
 * 各要素はAPIリクエストからシート書き込みまでの一連の処理を定義する設定単位。
 */
export const reportTasks: CloudflareReportTask[] = [
  // =================================================================
  // タスク1: Workerごとの詳細な実行ログ (Wall Timeを含む)
  // =================================================================
  {
    taskName: "worker_execution_logs",
    outputFile: "worker_execution_logs",
    apiSettings: {
      scope: "accounts",
      dataset: "workersInvocationsAdaptive",
      metrics: [
        "requests",
        "errors",
        "cpuTimeP50",
        "cpuTimeP90",
        "wallTimeP50",
        "wallTimeP90",
        "subrequests",
      ],
      dimensions: ["datetime", "scriptName", "status"],
      filters: workerFilters,
    },
    spreadsheetHeaders: [
      "datetime_jst",
      "datetime_jst_floored",
      "scriptName",
      "status",
      "requests",
      "errors",
      "cpuTimeP50",
      "cpuTimeP90",
      "wallTimeP50",
      "wallTimeP90",
      "subrequests",
    ],
  },

  // =================================================================
  // タスク2: サイト全体のトラフィック分析
  // =================================================================
  {
    taskName: "site_traffic_correlation",
    outputFile: "site_traffic_correlation",
    apiSettings: {
      scope: "zones",
      dataset: "httpRequestsAdaptiveGroups",
      metrics: ["count", "pageViews:visits"],
      dimensions: ["datetimeHour"],
      filters: {
        requestSource: "eyeball",
      },
    },
    spreadsheetHeaders: [
      "datetime_jst",
      "datetime_jst_floored",
      "count",
      "pageViews",
    ],
  },

  // =================================================================
  // タスク3: キャッシュ・パフォーマンス分析
  // =================================================================
  {
    taskName: "cache_performance_analysis",
    outputFile: "cache_performance_analysis",
    apiSettings: {
      scope: "zones",
      dataset: "httpRequestsAdaptiveGroups",
      metrics: ["count", "edgeResponseBytes"],
      dimensions: ["datetimeHour", "cacheStatus", "clientRequestPath"],
      filters: {
        requestSource: "eyeball",
      },
    },
    spreadsheetHeaders: [
      "datetime_jst",
      "datetime_jst_floored",
      "cacheStatus",
      "clientRequestPath",
      "count",
      "edgeResponseBytes",
    ],
  },

  // =================================================================
  // タスク4: トラフィック・ソース分析（Bot/API）
  // =================================================================
  {
    taskName: "traffic_source_analysis",
    outputFile: "traffic_source_analysis",
    apiSettings: {
      scope: "zones",
      dataset: "httpRequestsAdaptiveGroups",
      metrics: ["count", "edgeResponseBytes"],
      dimensions: ["datetimeHour", "requestSource"],
      filters: {},
    },
    spreadsheetHeaders: [
      "datetime_jst",
      "datetime_jst_floored",
      "requestSource",
      "count",
      "edgeResponseBytes",
    ],
  },
];
