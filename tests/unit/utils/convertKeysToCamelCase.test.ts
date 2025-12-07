import { describe, expect, it } from "vitest";
import { convertKeysToCamelCase } from "../../../src/utils/convertKeysToCamelCase";

describe("convertKeysToCamelCase", () => {
  it("スネークケースのキーをキャメルケースに変換する", () => {
    const input = {
      snake_case: "value",
      another_key: "another value",
      nested_object: {
        nested_key: "nested value",
      },
      array_with_objects: [{ item_id: 1 }, { item_id: 2 }],
    };

    const expected = {
      snakeCase: "value",
      anotherKey: "another value",
      nestedObject: {
        nestedKey: "nested value",
      },
      arrayWithObjects: [{ itemId: 1 }, { itemId: 2 }],
    };

    expect(convertKeysToCamelCase(input)).toEqual(expected);
  });

  it("既にキャメルケースのオブジェクトは変更しない", () => {
    const input = {
      alreadyCamel: "value",
      anotherCamel: "another",
    };

    expect(convertKeysToCamelCase(input)).toEqual(input);
  });

  it("プリミティブ値は変更せずそのまま返す", () => {
    expect(convertKeysToCamelCase("string")).toEqual("string");
    expect(convertKeysToCamelCase(123)).toEqual(123);
    expect(convertKeysToCamelCase(true)).toEqual(true);
    expect(convertKeysToCamelCase(null)).toEqual(null);
    expect(convertKeysToCamelCase(undefined)).toEqual(undefined);
  });

  it("配列内の各オブジェクトのキーを変換する", () => {
    const input = [
      { first_name: "John", last_name: "Doe" },
      { first_name: "Jane", last_name: "Smith" },
    ];

    const expected = [
      { firstName: "John", lastName: "Doe" },
      { firstName: "Jane", lastName: "Smith" },
    ];

    expect(convertKeysToCamelCase(input)).toEqual(expected);
  });
});
