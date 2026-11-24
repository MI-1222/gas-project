import type { CloudflareTimeRange } from "../types/cloudflare";

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 指定日時をJST基準の 'YYYY-MM-DD' 文字列に変換する。
 * @param date 対象の日時。
 * @returns JSTの日付文字列。
 */
function toJstDateString(date: Date): string {
  const jstDate = new Date(date.getTime() + JST_OFFSET_MS);
  return jstDate.toISOString().substring(0, 10);
}

/**
 * 基準日時の「昨日」の範囲をJST基準で計算し、UTCのISO 8601文字列で返す。
 * 例: 11/07 JST に実行された場合、JSTでの 11/06 00:00:00 から 11/07 00:00:00 の範囲を返す。
 * @param now 基準日時（省略時は現在時刻）。
 * @returns UTCのISO 8601形式の日時範囲。
 */
export function getYesterdayTimeRangeJst(
  now: Date = new Date(),
): CloudflareTimeRange {
  const todayJst = toJstDateString(now);
  const yesterday = new Date(now.getTime() - ONE_DAY_MS);
  const yesterdayJst = toJstDateString(yesterday);

  const startDate = new Date(`${yesterdayJst}T00:00:00+09:00`).toISOString();
  const endDate = new Date(`${todayJst}T00:00:00+09:00`).toISOString();

  return { startDate, endDate };
}

/**
 * UTCのタイムスタンプ文字列をJSTの 'YYYY-MM-DD HH:MM:SS' 形式に変換する。
 * @param utcTimestamp UTCのタイムスタンプ文字列。
 * @param floorToHour trueの場合、分と秒を00に切り捨てる。
 * @returns フォーマット済みのJST日時文字列。無効な入力の場合はnull。
 */
export function formatUtcToJstString(
  utcTimestamp: string | null | undefined,
  floorToHour: boolean = false,
): string | null {
  if (!utcTimestamp) {
    return null;
  }

  const utcDate = new Date(utcTimestamp);
  if (Number.isNaN(utcDate.getTime())) {
    return null;
  }

  const jstDate = new Date(utcDate.getTime() + JST_OFFSET_MS);
  if (floorToHour) {
    jstDate.setUTCMinutes(0, 0, 0);
  }

  return jstDate.toISOString().replace("T", " ").substring(0, 19);
}
