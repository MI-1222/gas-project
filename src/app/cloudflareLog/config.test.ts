import { parseWorkerNames } from "./config";

describe("parseWorkerNames", () => {
  it("カンマ区切りのWorker名をトリムして配列に変換する", () => {
    expect(parseWorkerNames("mi-1222, worker-2 , , worker-3")).toEqual([
      "mi-1222",
      "worker-2",
      "worker-3",
    ]);
  });

  it("未定義や空文字の場合は空配列を返す", () => {
    expect(parseWorkerNames(undefined)).toEqual([]);
    expect(parseWorkerNames("")).toEqual([]);
    expect(parseWorkerNames(" , ")).toEqual([]);
  });
});
