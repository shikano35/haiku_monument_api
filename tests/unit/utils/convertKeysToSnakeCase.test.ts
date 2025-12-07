import { describe, expect, it } from "vitest";
import { convertKeysToSnakeCase } from "../../../src/utils/convertKeysToSnakeCase";

describe("convertKeysToSnakeCase", () => {
  it("キャメルケースのキーをスネークケースに変換する", () => {
    const input = {
      camelCase: "value",
      anotherKey: "another value",
      nestedObject: {
        nestedKey: "nested value",
      },
      arrayWithObjects: [{ itemId: 1 }, { itemId: 2 }],
    };

    const expected = {
      camel_case: "value",
      another_key: "another value",
      nested_object: {
        nested_key: "nested value",
      },
      array_with_objects: [{ item_id: 1 }, { item_id: 2 }],
    };

    expect(convertKeysToSnakeCase(input)).toEqual(expected);
  });

  it("既にスネークケースのオブジェクトは変更しない", () => {
    const input = {
      already_snake: "value",
      another_snake: "another",
    };

    expect(convertKeysToSnakeCase(input)).toEqual(input);
  });

  it("プリミティブ値は変更せずそのまま返す", () => {
    expect(convertKeysToSnakeCase("string")).toEqual("string");
    expect(convertKeysToSnakeCase(123)).toEqual(123);
    expect(convertKeysToSnakeCase(true)).toEqual(true);
    expect(convertKeysToSnakeCase(null)).toEqual(null);
    expect(convertKeysToSnakeCase(undefined)).toEqual(undefined);
  });

  it("配列内の各オブジェクトのキーを変換する", () => {
    const input = [
      { firstName: "John", lastName: "Doe" },
      { firstName: "Jane", lastName: "Smith" },
    ];

    const expected = [
      { first_name: "John", last_name: "Doe" },
      { first_name: "Jane", last_name: "Smith" },
    ];

    expect(convertKeysToSnakeCase(input)).toEqual(expected);
  });
});
