export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface OrderingParams {
  ordering?: string[];
}

export interface DateFilterParams {
  published_at_gt?: string;
  published_at_gte?: string;
  published_at_lt?: string;
  published_at_lte?: string;
  updated_at_gt?: string;
  updated_at_gte?: string;
  updated_at_lt?: string;
  updated_at_lte?: string;
}

export interface SearchParams {
  search?: string;
  title_contains?: string;
  summary_contains?: string;
  title_contains_all?: string;
  summary_contains_all?: string;
}

export interface AuthorFilterParams {
  name_contains?: string;
  biography_contains?: string;
  created_at_gt?: string;
  created_at_lt?: string;
}

export interface LocationFilterParams {
  prefecture?: string;
  region?: string;
}

export interface QueryParams
  extends PaginationParams,
    OrderingParams,
    DateFilterParams,
    SearchParams,
    AuthorFilterParams,
    LocationFilterParams {}