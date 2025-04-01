interface PaginationParams {
  limit: number | null;
  offset: number | null;
}

interface OrderingParams {
  ordering: string[] | null;
}

interface DateFilterParams {
  created_at_gt: string | null;
  created_at_lt: string | null;
  updated_at_gt: string | null;
  updated_at_lt: string | null;
}

interface SearchParams {
  search: string | null;
  title_contains: string | null;
  description_contains: string | null;
  name_contains: string | null;
  biography_contains: string | null;
  prefecture: string | null;
  region: string | null;
}

export interface QueryParams
  extends PaginationParams,
    OrderingParams,
    DateFilterParams,
    SearchParams {}