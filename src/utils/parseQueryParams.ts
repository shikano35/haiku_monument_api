import type { QueryParams } from "../domain/common/QueryParams";

export function parseQueryParams(url: string): QueryParams {
  const query = new URL(url).searchParams;
  return {
    limit: query.get("limit") ? Number(query.get("limit")) : null,
    offset: query.get("offset") ? Number(query.get("offset")) : null,
    ordering: query.getAll("ordering").length ? query.getAll("ordering") : null,
    createdAtGt: query.get("created_at_gt") || null,
    createdAtLt: query.get("created_at_lt") || null,
    updatedAtGt: query.get("updated_at_gt") || null,
    updatedAtLt: query.get("updated_at_lt") || null,
    search: query.get("search") || null,
    q: query.get("q") || null,
    inscriptionContains: query.get("inscription_contains") || null,
    titleContains: query.get("title_contains") || null,
    nameContains: query.get("name_contains") || null,
    biographyContains: query.get("biography_contains") || null,
    canonicalNameContains: query.get("canonical_name_contains") || null,
    commentaryContains: query.get("commentary_contains") || null,
    poetNameContains: query.get("poet_name_contains") || null,
    textContains: query.get("text_contains") || null,
    prefecture: query.get("prefecture") || null,
    region: query.get("region") || null,
    municipality: query.get("municipality") || null,
    kigo: query.get("kigo") || null,
    season: query.get("season") || null,
    poetId: query.get("poet_id") ? Number(query.get("poet_id")) : null,
    locationId: query.get("location_id") ? Number(query.get("location_id")) : null,
    material: query.get("material") || null,
    monumentType: query.get("monument_type") || null,
  };
}
