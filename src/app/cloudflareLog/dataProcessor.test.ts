import type {
  CloudflareGraphQLResponse,
  CloudflareReportTask,
} from "../../types/cloudflare";
import { jsonToSheetData } from "./dataProcessor";

describe("jsonToSheetData", () => {
  const task: CloudflareReportTask = {
    taskName: "site_traffic_correlation",
    outputFile: "site_traffic_correlation",
    apiSettings: {
      scope: "zones",
      dataset: "httpRequestsAdaptiveGroups",
      metrics: ["count", "pageViews:visits"],
      dimensions: ["datetimeHour"],
      filters: { requestSource: "eyeball" },
    },
    spreadsheetHeaders: [
      "datetime_jst",
      "datetime_jst_floored",
      "count",
      "pageViews",
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("APIレスポンスをヘッダー行付きの二次元配列に変換する", () => {
    const response: CloudflareGraphQLResponse = {
      data: {
        viewer: {
          zones: [
            {
              httpRequestsAdaptiveGroups: [
                {
                  dimensions: { datetimeHour: "2025-09-20T23:17:42Z" },
                  count: 150,
                  sum: { visits: 42 },
                },
              ],
            },
          ],
        },
      },
    };

    const result = jsonToSheetData(response, task);

    expect(result).toEqual([
      ["datetime_jst", "datetime_jst_floored", "count", "pageViews"],
      ["2025-09-21 08:17:42", "2025-09-21 08:00:00", 150, 42],
    ]);
  });

  it("データが空配列の場合はヘッダー行のみを返す", () => {
    const response: CloudflareGraphQLResponse = {
      data: {
        viewer: {
          zones: [{ httpRequestsAdaptiveGroups: [] }],
        },
      },
    };

    const result = jsonToSheetData(response, task);

    expect(result).toEqual([
      ["datetime_jst", "datetime_jst_floored", "count", "pageViews"],
    ]);
  });
});
