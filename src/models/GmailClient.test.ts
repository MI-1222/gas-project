import { GmailClient } from "./GmailClient";

describe("GmailClient", () => {
  let client: GmailClient;

  // 各テスト実行前の初期化
  beforeEach(() => {
    client = new GmailClient();
    jest.clearAllMocks();
  });

  it("should fetch unread threads", () => {
    const query = "is:unread";
    // モックデータの作成
    const mockThreads = [{ getId: () => "thread1" }];
    (GmailApp.search as jest.Mock).mockReturnValue(mockThreads);

    // 未読スレッド取得の実行
    const result = client.fetchUnreadThreads(query);

    // GmailApp.searchが正しく呼ばれたか検証
    expect(GmailApp.search).toHaveBeenCalledWith(query);
    expect(result).toBe(mockThreads);
  });
});
