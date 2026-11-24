import type { TargetCell } from "@/types/targetCell";

/**
 * Google Spreadsheetの操作を担当するクラス
 */
export class GsheetClient {
  private sheet: GoogleAppsScript.Spreadsheet.Sheet;

  /**
   * @param sheet 対象のGoogle Spreadsheet シートオブジェクト
   */
  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.sheet = sheet;
  }

  /**
   * メッセージIDを記録する。
   * 2行目の前に新しい行を挿入し、指定したセルにIDを書き込む。
   * 行と列の片方だけ設定することはできない。
   * @param msgId メッセージID
   * @param targetCell 記録するセルのアドレス(デフォルト: "A3"(={row:3,col:1}))
   */
  public recordMessageId(msgId: string, targetCell?: TargetCell): void {
    this.sheet.insertRowBefore(2);
    this.sheet
      .getRange(targetCell?.row ?? 3, targetCell?.col ?? 1)
      .setValue(msgId);
  }

  /**
   * メッセージが既に処理済みか確認する。
   * @param msgId メッセージID
   * @returns 全て処理済みであればtrue
   */
  public isProcessedMessage(msgId: string): boolean {
    const textFinder = this.sheet.createTextFinder(msgId);
    const ranges = textFinder.findAll();
    return ranges.length > 0;
  }

  /**
   * Webhook URLを取得する。
   * 指定されたセルから値を読み取る。
   * 行と列の片方だけ設定することはできない。
   * @param row セルの行番号(デフォルト: 1)
   * @param col セルの列番号(デフォルト: 3)
   * @returns Webhook URL
   */
  public getWebhookUrl(targetCell?: TargetCell): string {
    return this.sheet
      .getRange(targetCell?.row ?? 1, targetCell?.col ?? 3)
      .getValue();
  }
}
