import type { MailData } from "@/types/mail";

/**
 * Discordの操作を担当するクラス
 */
export class DiscordClient {
  private webhookUrl: string;

  /**
   * @param webhookUrl DiscordのWebhook URL
   */
  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  /**
   * Discordにメールを転送する
   * @param mailData 転送するメールデータ
   */
  public forwardMail(mailData: MailData, maxLength: number = 300): void {
    const payload: GoogleAppsScript.URL_Fetch.Payload = {
      content: mailData.subject,
      embeds: [
        {
          title: mailData.subject,
          author: {
            name: mailData.from,
          },
          description: mailData.plainBody.slice(0, maxLength),
        },
      ],
    };

    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
    };

    UrlFetchApp.fetch(this.webhookUrl, options);
  }
}
