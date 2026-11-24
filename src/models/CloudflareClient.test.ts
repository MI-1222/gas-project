import type { CloudflareReportTask } from "../types/cloudflare";
import { CloudflareClient } from "./CloudflareClient";

describe("CloudflareClient", () => {
  const sampleAccountTask: CloudflareReportTask = {
    taskName: "worker_test",
    outputFile: "worker_test",
    apiSettings: {
      scope: "accounts",
      dataset: "workersInvocationsAdaptive",
      metrics: ["requests", "cpuTimeP50"],
      dimensions: ["datetime", "scriptName"],
      filters: { scriptName_in: ["my-worker"] },
    },
    spreadsheetHeaders: [
      "datetime_jst",
      "scriptName",
      "requests",
      "cpuTimeP50",
    ],
  };

  const sampleZoneTask: CloudflareReportTask = {
    taskName: "zone_test",
    outputFile: "zone_test",
    apiSettings: {
      scope: "zones",
      dataset: "httpRequestsAdaptiveGroups",
      metrics: ["count", "pageViews:visits"],
      dimensions: ["datetimeHour"],
      filters: { requestSource: "eyeball" },
    },
    spreadsheetHeaders: ["datetime_jst", "count", "pageViews"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("apiTokenが空の場合は初期化時にエラーを投げる", () => {
    expect(() => new CloudflareClient({ apiToken: "" })).toThrow(
      "CLOUDFLARE_READ_API_TOKEN が設定されていません。",
    );
  });

  it("accountsスコープのGraphQLクエリを正しく構築する", () => {
    const client = new CloudflareClient({
      apiToken: "token",
      accountId: "acc-123",
    });
    const query = client.buildGraphQLQuery(sampleAccountTask);

    expect(query).toContain("query GetAccountAnalytics($accountTag: string!");
    expect(query).toContain(
      "AccountWorkersInvocationsAdaptiveFilter_InputObject",
    );
    expect(query).toContain("orderBy: [datetime_ASC]");
    expect(query).toContain("sum { requests }");
    expect(query).toContain("quantiles { cpuTimeP50 }");
  });

  it("zonesスコープでマッピング付きメトリクスを含むクエリを正しく構築する", () => {
    const client = new CloudflareClient({
      apiToken: "token",
      zoneTag: "zone-456",
    });
    const query = client.buildGraphQLQuery(sampleZoneTask);

    expect(query).toContain("query GetZoneAnalytics($zoneTag: string!");
    expect(query).toContain("ZoneHttpRequestsAdaptiveGroupsFilter_InputObject");
    expect(query).toContain("count");
    expect(query).toContain("sum { visits }");
  });

  it("fetchLogsでUrlFetchAppを呼び出してレスポンスを返す", () => {
    const mockResponseData = {
      data: {
        viewer: {
          accounts: [
            { workersInvocationsAdaptive: [{ sum: { requests: 10 } }] },
          ],
        },
      },
    };

    (UrlFetchApp.fetch as jest.Mock).mockReturnValue({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify(mockResponseData),
    });

    const client = new CloudflareClient({
      apiToken: "test-token",
      accountId: "acc-123",
    });

    const result = client.fetchLogs(sampleAccountTask, {
      startDate: "2025-11-05T15:00:00.000Z",
      endDate: "2025-11-06T15:00:00.000Z",
    });

    expect(result).toEqual(mockResponseData);
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/graphql",
      expect.objectContaining({
        method: "post",
        contentType: "application/json",
        headers: { Authorization: "Bearer test-token" },
        muteHttpExceptions: true,
      }),
    );
  });

  it("accountId未設定でaccountsスコープを実行するとエラーを投げる", () => {
    const client = new CloudflareClient({ apiToken: "test-token" });

    expect(() =>
      client.fetchLogs(sampleAccountTask, {
        startDate: "2025-11-05T15:00:00.000Z",
        endDate: "2025-11-06T15:00:00.000Z",
      }),
    ).toThrow("CLOUDFLARE_ACCOUNT_ID が必要です");
  });

  it("GraphQLエラーが返却された場合は例外を投げる", () => {
    (UrlFetchApp.fetch as jest.Mock).mockReturnValue({
      getResponseCode: () => 200,
      getContentText: () =>
        JSON.stringify({ errors: [{ message: "syntax error" }] }),
    });

    const client = new CloudflareClient({
      apiToken: "test-token",
      accountId: "acc-123",
    });

    expect(() =>
      client.fetchLogs(sampleAccountTask, {
        startDate: "2025-11-05T15:00:00.000Z",
        endDate: "2025-11-06T15:00:00.000Z",
      }),
    ).toThrow("GraphQLクエリがエラーを返しました");
  });
});
