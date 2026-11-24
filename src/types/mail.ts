export interface MailData {
  msgId: string;
  subject: string;
  from: string;
  to?: string;
  plainBody: string;
}
