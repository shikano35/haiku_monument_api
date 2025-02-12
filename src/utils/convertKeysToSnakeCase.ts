export const convertKeysToSnakeCase = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnakeCase(item)) as T;
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        const snakeKey = key.replace(/([A-Z])/g, letter => `_${letter.toLowerCase()}`);
        return [snakeKey, convertKeysToSnakeCase(value)];
      })
    ) as T;
  }
  return obj;
};
