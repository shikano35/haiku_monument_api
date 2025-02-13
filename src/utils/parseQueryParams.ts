import type { QueryParams } from "../domain/common/QueryParams";

export function parseQueryParams(query: URLSearchParams): QueryParams {
  return {
    limit: query.get('limit') ? Number(query.get('limit')) : undefined,
    offset: query.get('offset') ? Number(query.get('offset')) : undefined,
    ordering: query.getAll('ordering').length ? query.getAll('ordering') : undefined,
    updated_at_gt: query.get('updated_at_gt') || undefined,
    updated_at_lt: query.get('updated_at_lt') || undefined,
    search: query.get('search') || undefined,
    title_contains: query.get('title_contains') || undefined,
    name_contains: query.get('name_contains') || undefined,
    biography_contains: query.get('biography_contains') || undefined,
    created_at_gt: query.get('created_at_gt') || undefined,
    created_at_lt: query.get('created_at_lt') || undefined,
    prefecture: query.get('prefecture') || undefined,
    region: query.get('region') || undefined,
  };
}
