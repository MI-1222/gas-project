import type {
  CloudflareGraphQLResponse,
  CloudflareReportTask,
} from "../../types/cloudflare";
import { formatUtcToJstString } from "../../utils/jstDate";
import { getNestedValue } from "../../utils/objectPath";

/**
 * Cloudflare APIから取得したJSONデータを、指定されたタスク設定に基づきスプレッドシート用の二次元配列に変換する。
 * @param jsonData APIから取得したJSONレスポンスデータ。
 * @param task 単一のレポートタスク設定。
 * @returns スプレッドシート書き込み用の二次元配列（ヘッダー行を含む）。
 */
export function jsonToSheetData(
  jsonData: CloudflareGraphQLResponse,
  task: CloudflareReportTask,
): unknown[][] {
  const { dataset, scope, dimensions, metrics } = task.apiSettings;
  const { spreadsheetHeaders } = task;

  const metricAliasMap = new Map<string, string>();
  for (const metric of metrics) {
    const [displayName, apiField] = metric.split(":");
    if (displayName && apiField) {
      metricAliasMap.set(displayName, apiField);
    }
  }

  const primaryTimestampKey = dimensions[0] || "datetime";
  Logger.log(
    `[INFO] JST変換キーとして '${primaryTimestampKey}' を使用 (タスク: '${task.taskName}')`,
  );

  const dataToConvert = getNestedValue<unknown[]>(
    jsonData,
    `data.viewer.${scope}.0.${dataset}`,
    [],
  );

  const headerRow = spreadsheetHeaders.map(
    (header) => header.split(":")[0] ?? header,
  );

  if (!Array.isArray(dataToConvert)) {
    Logger.log(
      `[ERROR] 変換対象のデータ(${scope} -> ${dataset})が見つからないか、配列ではありません。`,
    );
    return [headerRow];
  }

  if (dataToConvert.length === 0) {
    Logger.log(
      `[INFO] タスク '${task.taskName}' の変換対象データが0件でした。`,
    );
    return [headerRow];
  }

  const dataRows = dataToConvert.map((row) => {
    return spreadsheetHeaders.map((header) => {
      if (header === "datetime_jst") {
        const utcTimestamp = getNestedValue<string>(
          row,
          `dimensions.${primaryTimestampKey}`,
        );
        return formatUtcToJstString(utcTimestamp, false);
      }

      if (header === "datetime_jst_floored") {
        const utcTimestamp = getNestedValue<string>(
          row,
          `dimensions.${primaryTimestampKey}`,
        );
        return formatUtcToJstString(utcTimestamp, true);
      }

      const apiField =
        header.split(":")[1] || metricAliasMap.get(header) || header;
      const candidatePaths = [
        `sum.${apiField}`,
        `quantiles.${apiField}`,
        `dimensions.${apiField}`,
        apiField,
      ];

      for (const path of candidatePaths) {
        const value = getNestedValue(row, path);
        if (value !== null) {
          return value;
        }
      }

      return null;
    });
  });

  return [headerRow, ...dataRows];
}
