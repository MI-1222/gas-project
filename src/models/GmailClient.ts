/**
 * Gmailの操作を担当するクラス
 */
export class GmailClient {
  /**
   * 未読メールのスレッドを取得する
   * @param query 検索クエリ
   * @returns Gmailのスレッド配列
   */
  public fetchUnreadThreads(
    query: string,
  ): GoogleAppsScript.Gmail.GmailThread[] {
    return GmailApp.search(query);
  }
}
