import type { QueryParams } from "../domain/common/QueryParams";

export function parseQueryParams(query: URLSearchParams): QueryParams {
  return {
    limit: query.get("limit") ? Number(query.get("limit")) : null,
    offset: query.get("offset") ? Number(query.get("offset")) : null,
    ordering: query.getAll("ordering").length ? query.getAll("ordering") : null,
    updated_at_gt: query.get("updated_at_gt") || null,
    updated_at_lt: query.get("updated_at_lt") || null,
    search: query.get("search") || null,
    title_contains: query.get("title_contains") || null,
    name_contains: query.get("name_contains") || null,
    biography_contains: query.get("biography_contains") || null,
    created_at_gt: query.get("created_at_gt") || null,
    created_at_lt: query.get("created_at_lt") || null,
    prefecture: query.get("prefecture") || null,
    region: query.get("region") || null,
    description_contains: query.get("description_contains") || null,
  };
}
