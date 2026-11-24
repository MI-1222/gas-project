/**
 * レコードのキーを全て指定するか、全て指定しないパターンのみ許可する
 */
export type AllOrNone<T extends Record<string, unknown>> =
  | {
      [K in keyof T]: T[K] | undefined;
    }
  | {
      [K in keyof T]?: never;
    };
