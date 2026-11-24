import { CloudflareClient } from "../../models/CloudflareClient";
import { getYesterdayTimeRangeJst } from "../../utils/jstDate";
import { reportTasks } from "./config";
import { jsonToSheetData } from "./dataProcessor";

(global as any).main = () => {
  fetchAndRecordLogs();
};

/**
 * Cloudflareからログを取得し、アクティブなスプレッドシートに記録するメイン処理。
 */
function fetchAndRecordLogs(): void {
  Logger.log("[INFO] 日次ログ取得プロセスを開始します...");

  if (reportTasks.length === 0) {
    Logger.log(
      "[INFO] 実行対象のレポートタスクがありません。config.tsを確認してください。",
    );
    return;
  }

  const client = new CloudflareClient({
    apiToken: process.env.CLOUDFLARE_READ_API_TOKEN ?? "",
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
    zoneTag: process.env.CLOUDFLARE_ZONE_TAG ?? "",
  });

  const timeRange = getYesterdayTimeRangeJst();
  Logger.log(
    `[INFO] 対象期間 (UTC): ${timeRange.startDate} から ${timeRange.endDate} まで`,
  );

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log(`[INFO] ${reportTasks.length}件のレポートタスクを開始します...`);

  for (const task of reportTasks) {
    try {
      Logger.log(`\n--- タスク '${task.taskName}' を開始 ---`);

      const jsonData = client.fetchLogs(task, timeRange);
      Logger.log(
        `[INFO] タスク '${task.taskName}': ログデータの取得が完了しました。`,
      );

      const sheetData = jsonToSheetData(jsonData, task);
      Logger.log(
        `[INFO] タスク '${task.taskName}': シート用データへの変換が完了しました。`,
      );

      const headerRow = sheetData[0];
      if (!headerRow || sheetData.length <= 1) {
        Logger.log(
          `[INFO] タスク '${task.taskName}': 有効なデータが0件のため、シート書き込みをスキップします。`,
        );
        continue;
      }

      const sheetName = task.outputFile;
      let sheet = spreadsheet.getSheetByName(sheetName);

      if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        Logger.log(
          `[INFO] タスク '${task.taskName}': シート '${sheetName}' を新規作成しました。`,
        );
        sheet
          .getRange(1, 1, sheetData.length, headerRow.length)
          .setValues(sheetData);
        Logger.log(
          `[INFO] タスク '${task.taskName}': シート '${sheetName}' に ${sheetData.length - 1} 件のデータを書き込みました。`,
        );
      } else {
        const dataRowsOnly = sheetData.slice(1);
        const firstDataRow = dataRowsOnly[0];
        if (!firstDataRow) {
          continue;
        }
        const startRow = sheet.getLastRow() + 1;
        sheet
          .getRange(startRow, 1, dataRowsOnly.length, firstDataRow.length)
          .setValues(dataRowsOnly);
        Logger.log(
          `[INFO] タスク '${task.taskName}': シート '${sheetName}' の ${startRow} 行目に ${dataRowsOnly.length} 件のデータを追記しました。`,
        );
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.log(
        `[ERROR] タスク '${task.taskName}' の処理中にエラーが発生しました: ${err.message} \n${err.stack || ""}`,
      );
    }
  }

  Logger.log("\n--- 全てのレポートタスクが完了しました ---");
}
