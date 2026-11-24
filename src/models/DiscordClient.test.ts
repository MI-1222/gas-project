import { DiscordClient } from "./DiscordClient";
import type { MailData } from "@/types/mail";

describe("DiscordClient", () => {
  const webhookUrl = "https://discord.com/api/webhooks/test";
  let client: DiscordClient;

  // 各テスト実行前の初期化
  beforeEach(() => {
    client = new DiscordClient(webhookUrl);
    jest.clearAllMocks();
  });

  it("should send mail data to Discord", () => {
    // テスト用のメールデータ作成
    const mailData: MailData = {
      subject: "Test Subject",
      from: "test@example.com",
      plainBody: "This is a test body.",
      msgId: "test",
    };

    // メール転送メソッドの実行
    client.forwardMail(mailData);

    // UrlFetchApp.fetchが正しく呼ばれたか検証
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      webhookUrl,
      expect.objectContaining({
        method: "post",
        contentType: "application/json",
        payload: expect.stringContaining("Test Subject"),
      }),
    );
  });

  it("should truncate body if it exceeds maxLength", () => {
    // 長文のメールデータ作成
    const mailData: MailData = {
      subject: "Long Body Test",
      from: "test@example.com",
      plainBody: "a".repeat(500),
      msgId: "test",
    };

    // 制限付きで転送実行
    client.forwardMail(mailData, 100);

    // 送信されたペイロードの検証
    const callArgs = (UrlFetchApp.fetch as jest.Mock).mock.calls[0];
    const payload = JSON.parse(callArgs[1].payload);

    // 本文が切り詰められているか確認
    expect(payload.embeds[0].description.length).toBe(100);
  });
});
