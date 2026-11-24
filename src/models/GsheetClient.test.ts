import { GsheetClient } from "./GsheetClient";

describe("GsheetClient", () => {
  let mockSheet: any;
  let client: GsheetClient;

  // 各テスト実行前の初期化
  beforeEach(() => {
    // シートオブジェクトのモック作成
    mockSheet = {
      insertRowBefore: jest.fn(),
      getRange: jest.fn().mockReturnValue({
        setValue: jest.fn(),
        getValue: jest.fn(),
      }),
      createTextFinder: jest.fn().mockReturnValue({
        findAll: jest.fn().mockReturnValue([]),
      }),
    };
    client = new GsheetClient(mockSheet);
  });

  it("should record message id", () => {
    // メッセージIDの記録実行
    client.recordMessageId("msg123");
    // 行挿入と値のセットが呼ばれたか検証
    expect(mockSheet.insertRowBefore).toHaveBeenCalledWith(2);
    expect(mockSheet.getRange).toHaveBeenCalledWith(3, 1);
  });

  it("should check if message is processed", () => {
    // 処理済み確認の実行
    client.isProcessedMessage("msg123");
    // 検索が実行されたか検証
    expect(mockSheet.createTextFinder).toHaveBeenCalledWith("msg123");
  });

  it("should return true if message is found", () => {
    // 検索結果がある場合のモック設定
    mockSheet.createTextFinder().findAll.mockReturnValue(["found"]);
    // trueが返ることを検証
    expect(client.isProcessedMessage("msg123")).toBe(true);
  });

  it("should get webhook url", () => {
    // URL取得のモック設定
    mockSheet.getRange().getValue.mockReturnValue("https://example.com");
    // URL取得の実行
    const url = client.getWebhookUrl();
    // 取得結果の検証
    expect(url).toBe("https://example.com");
  });
});
