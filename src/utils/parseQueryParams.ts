import type { QueryParams } from "../domain/common/QueryParams";

export function parseQueryParams(url: string): QueryParams {
  const query = new URL(url).searchParams;
  return {
    limit: query.get("limit") ? Number(query.get("limit")) : null,
    offset: query.get("offset") ? Number(query.get("offset")) : null,
    ordering: query.getAll("ordering").length ? query.getAll("ordering") : null,
    updated_at_gt: query.get("updated_at_gt") || null,
    updated_at_lt: query.get("updated_at_lt") || null,
    search: query.get("search") || null,
    text_contains: query.get("text_contains") || null,
    inscription_contains: query.get("inscription_contains") || null,
    title_contains: query.get("title_contains") || null,
    name_contains: query.get("name_contains") || null,
    biography_contains: query.get("biography_contains") || null,
    created_at_gt: query.get("created_at_gt") || null,
    created_at_lt: query.get("created_at_lt") || null,
    prefecture: query.get("prefecture") || null,
    region: query.get("region") || null,
    municipality: query.get("municipality") || null,
    description_contains: query.get("description_contains") || null,
    kigo: query.get("kigo") || null,
    season: query.get("season") || null,
    poet_id: query.get("poet_id") ? Number(query.get("poet_id")) : null,
  };
}
