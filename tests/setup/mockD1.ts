export {};

interface MockD1Statement {
  all(): Promise<unknown[]>;
  run(): Promise<Record<string, unknown>>;
}

interface MockD1Database {
  prepare(query: string): MockD1Statement;
}

declare global {
  var DB: MockD1Database | undefined;
}

if (!globalThis.DB) {
  globalThis.DB = {
    prepare(query: string): MockD1Statement {
      console.log(`MockD1Database.prepare called with query: ${query}`);
      return {
        async all(): Promise<unknown[]> {
          return [];
        },
        async run(): Promise<Record<string, unknown>> {
          return {};
        },
      };
    },
  };
}
