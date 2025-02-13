export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface OrderingParams {
  ordering?: string[];
}

export interface DateFilterParams {
  created_at_gt?: string;
  created_at_lt?: string;
  updated_at_gt?: string;
  updated_at_lt?: string;
}

export interface SearchParams {
  search?: string;
  title_contains?: string;
  description_contains?: string;
  name_contains?: string;
  biography_contains?: string;
  prefecture?: string;
  region?: string;
}

export interface QueryParams
  extends PaginationParams,
    OrderingParams,
    DateFilterParams,
    SearchParams {}