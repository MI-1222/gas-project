import { getNestedValue } from "./objectPath";

describe("getNestedValue", () => {
  it("ネストされたプロパティをドット区切りパスで取得できる", () => {
    const obj = {
      data: {
        viewer: {
          accounts: [{ workersInvocationsAdaptive: [1, 2, 3] }],
        },
      },
    };
    expect(
      getNestedValue(obj, "data.viewer.accounts.0.workersInvocationsAdaptive"),
    ).toEqual([1, 2, 3]);
  });

  it("存在しないパスやnull/undefinedに対して既定値を返す", () => {
    const obj = { a: { b: null } };
    expect(getNestedValue(obj, "a.b", "fallback")).toBe("fallback");
    expect(getNestedValue(obj, "a.c.d", 0)).toBe(0);
    expect(getNestedValue(null, "a.b")).toBeNull();
  });
});
