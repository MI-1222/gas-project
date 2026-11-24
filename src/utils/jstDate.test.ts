import { formatUtcToJstString, getYesterdayTimeRangeJst } from "./jstDate";

describe("jstDate", () => {
  describe("getYesterdayTimeRangeJst", () => {
    it("基準日時の前日00:00〜当日00:00（JST）をUTC ISO文字列で返す", () => {
      // 2025-11-07 10:00:00 JST (= 2025-11-07 01:00:00 UTC)
      const now = new Date("2025-11-07T01:00:00.000Z");
      const range = getYesterdayTimeRangeJst(now);

      expect(range).toEqual({
        startDate: "2025-11-05T15:00:00.000Z",
        endDate: "2025-11-06T15:00:00.000Z",
      });
    });

    it("UTCでは前日になるJST早朝の境界でも正しくJST基準で計算する", () => {
      // 2025-11-07 02:00:00 JST (= 2025-11-06 17:00:00 UTC)
      const now = new Date("2025-11-06T17:00:00.000Z");
      const range = getYesterdayTimeRangeJst(now);

      expect(range).toEqual({
        startDate: "2025-11-05T15:00:00.000Z",
        endDate: "2025-11-06T15:00:00.000Z",
      });
    });
  });

  describe("formatUtcToJstString", () => {
    it("UTCタイムスタンプをJST文字列に変換する", () => {
      expect(formatUtcToJstString("2025-09-20T23:17:42Z")).toBe(
        "2025-09-21 08:17:42",
      );
    });

    it("floorToHourがtrueのとき分・秒を00に切り捨てる", () => {
      expect(formatUtcToJstString("2025-09-20T23:17:42Z", true)).toBe(
        "2025-09-21 08:00:00",
      );
    });

    it("null・空文字・不正な文字列に対してnullを返す", () => {
      expect(formatUtcToJstString(null)).toBeNull();
      expect(formatUtcToJstString(undefined)).toBeNull();
      expect(formatUtcToJstString("invalid-date")).toBeNull();
    });
  });
});
