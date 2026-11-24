/**
 * ネストされたオブジェクトからドット区切りのパス文字列を使って安全に値を取得する。
 * @param obj 検索対象のオブジェクト。
 * @param path 取得したいプロパティへのパス（例: 'sum.requests'）。
 * @param defaultValue パスが見つからない場合や値がnull/undefinedの場合に返す既定値。
 * @returns 取得した値、または既定値。
 */
export function getNestedValue<T = unknown>(
  obj: unknown,
  path: string,
  defaultValue: T | null = null,
): T | null {
  const keys = path.split(".");
  let result: unknown = obj;

  for (const key of keys) {
    if (result === undefined || result === null || typeof result !== "object") {
      return defaultValue;
    }
    result = (result as Record<string, unknown>)[key];
  }

  return result !== undefined && result !== null ? (result as T) : defaultValue;
}
