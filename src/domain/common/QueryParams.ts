export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface OrderingParams {
  ordering?: string[];
}

export interface DateFilterParams {
  createdAtGt?: string;
  createdAtLt?: string;
  updatedAtGt?: string;
  updatedAtLt?: string;
}

export interface SearchParams {
  search?: string;
}

export interface LocationFilterParams {
  prefecture?: string;
  region?: string;
  bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
}

// 基本QueryParams（共通部分）
export interface BaseQueryParams extends PaginationParams, OrderingParams, DateFilterParams, SearchParams {}

// 地理的検索が可能なエンティティ用
export interface GeoQueryParams extends BaseQueryParams, LocationFilterParams {}

// Monument専用QueryParams
export interface MonumentQueryParams extends GeoQueryParams {
  // 全文検索
  q?: string;
  
  // フィールド指定検索
  canonicalNameContains?: string;
  titleContains?: string;
  inscriptionContains?: string;
  commentaryContains?: string;
  
  // 俳人関連
  poetNameContains?: string;
  poetId?: number;
  
  // 俳句関連
  kigo?: string;
  season?: string;
  
  // 素材・種類
  material?: string;
  monumentType?: string;
  
  // 地理関連
  locationId?: number;
  
  // 時間関連
  establishedStart?: string;
  establishedEnd?: string;
  intervalStart?: string;
  intervalEnd?: string;
  
  // メディア・品質
  hasMedia?: boolean;
  uncertain?: boolean;
  
  // 関連データ展開
  expand?: string[];
  
  // レガシー互換
  nameContains?: string;
  biographyContains?: string;
}

// Location専用QueryParams
export interface LocationQueryParams extends BaseQueryParams, LocationFilterParams {
  imiPrefCode?: string;
}

// Poet専用QueryParams
export interface PoetQueryParams extends BaseQueryParams {
  nameContains?: string;
  biographyContains?: string;
  birthYear?: number;
  deathYear?: number;
}

// Source専用QueryParams
export interface SourceQueryParams extends BaseQueryParams {
  titleContains?: string;
  authorContains?: string;
  publisherContains?: string;
  sourceYear?: number;
  sourceYearGt?: number;
  sourceYearLt?: number;
}

// Inscription専用QueryParams
export interface InscriptionQueryParams extends BaseQueryParams {
  monumentId?: number;
  side?: string;
  language?: string;
  sourceId?: number;
}

// Poem専用QueryParams
export interface PoemQueryParams extends BaseQueryParams {
  kigo?: string;
  season?: string;
  poetId?: number;
}

// Event専用QueryParams
export interface EventQueryParams extends BaseQueryParams {
  monumentId?: number;
  eventType?: string;
  actor?: string;
  sourceId?: number;
  intervalStart?: string;
  intervalEnd?: string;
}

// Media専用QueryParams
export interface MediaQueryParams extends BaseQueryParams {
  monumentId?: number;
  mediaType?: string;
  photographer?: string;
  license?: string;
}

export interface QueryParams extends BaseQueryParams {
  title_contains?: string;
  description_contains?: string;
  name_contains?: string;
  biography_contains?: string;
  prefecture?: string;
  region?: string;
  created_at_gt?: string;
  created_at_lt?: string;
  updated_at_gt?: string;
  updated_at_lt?: string;
}
