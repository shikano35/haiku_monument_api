export interface PaginationParams {
  limit?: number | null;
  offset?: number | null;
}

export interface OrderingParams {
  ordering?: string[] | null;
}

export interface DateFilterParams {
  createdAtGt?: string | null;
  createdAtLt?: string | null;
  updatedAtGt?: string | null;
  updatedAtLt?: string | null;
}

export interface SearchParams {
  search?: string | null;
}

export interface LocationFilterParams {
  prefecture?: string | null;
  region?: string | null;
  municipality?: string | null;
  bbox?: [number, number, number, number] | null; // [minLon, minLat, maxLon, maxLat]
}

// 基本QueryParams（共通部分）
export interface BaseQueryParams
  extends PaginationParams,
    OrderingParams,
    DateFilterParams,
    SearchParams {}

// 地理的検索が可能なエンティティ用
export interface GeoQueryParams extends BaseQueryParams, LocationFilterParams {}

// Monument専用QueryParams
export interface MonumentQueryParams extends GeoQueryParams {
  // 全文検索
  q?: string | null;

  // フィールド指定検索
  canonicalNameContains?: string | null;
  titleContains?: string | null;
  inscriptionContains?: string | null;
  commentaryContains?: string | null;

  // 俳人関連
  poetNameContains?: string | null;
  poetId?: number | null;

  // 俳句関連
  kigo?: string | null;
  season?: string | null;

  // 素材・種類
  material?: string | null;
  monumentType?: string | null;

  // 地理関連
  locationId?: number | null;

  // 時間関連
  establishedStart?: string | null;
  establishedEnd?: string | null;
  intervalStart?: string | null;
  intervalEnd?: string | null;

  // メディア・品質
  hasMedia?: boolean | null;
  uncertain?: boolean | null;

  // 関連データ展開
  expand?: string[] | null;

  // レガシー互換
  nameContains?: string | null;
  biographyContains?: string | null;
}

// Location専用QueryParams
export interface LocationQueryParams
  extends BaseQueryParams,
    LocationFilterParams {
  imiPrefCode?: string | null;
}

// Poet専用QueryParams
export interface PoetQueryParams extends BaseQueryParams {
  nameContains?: string | null;
  biographyContains?: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
}

// Source専用QueryParams
export interface SourceQueryParams extends BaseQueryParams {
  titleContains?: string | null;
  authorContains?: string | null;
  publisherContains?: string | null;
  sourceYear?: number | null;
  sourceYearGt?: number | null;
  sourceYearLt?: number | null;
}

// Inscription専用QueryParams
export interface InscriptionQueryParams extends BaseQueryParams {
  monumentId?: number | null;
  side?: string | null;
  language?: string | null;
  sourceId?: number | null;
}

// Poem専用QueryParams
export interface PoemQueryParams extends BaseQueryParams {
  textContains?: string | null;
  kigo?: string | null;
  season?: string | null;
  poetId?: number | null;
}

// Event専用QueryParams
export interface EventQueryParams extends BaseQueryParams {
  monumentId?: number | null;
  eventType?: string | null;
  actor?: string | null;
  sourceId?: number | null;
  intervalStart?: string | null;
  intervalEnd?: string | null;
}

// Media専用QueryParams
export interface MediaQueryParams extends BaseQueryParams {
  monumentId?: number | null;
  mediaType?: string | null;
  photographer?: string | null;
  license?: string | null;
}

export interface QueryParams extends BaseQueryParams {
  inscriptionContains?: string | null;
  titleContains?: string | null;
  nameContains?: string | null;
  biographyContains?: string | null;
  canonicalNameContains?: string | null;
  commentaryContains?: string | null;
  poetNameContains?: string | null;
  textContains?: string | null;
  prefecture?: string | null;
  region?: string | null;
  municipality?: string | null;
  kigo?: string | null;
  season?: string | null;
  poetId?: number | null;
  locationId?: number | null;
  material?: string | null;
  monumentType?: string | null;
  q?: string | null;
}
