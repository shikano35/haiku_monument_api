import { describe, it, expect } from 'vitest';
import { parseQueryParams } from '../../../src/utils/parseQueryParams';

describe('parseQueryParams', () => {
  it('クエリパラメータをオブジェクトに解析する', () => {
    const query = new URLSearchParams('limit=10&offset=20&region=Tokyo');
    
    const result = parseQueryParams(query);
    
    expect(result).toEqual({
      limit: 10,
      offset: 20,
      ordering: null,
      updated_at_gt: null,
      updated_at_lt: null,
      search: null,
      title_contains: null,
      name_contains: null,
      biography_contains: null,
      created_at_gt: null,
      created_at_lt: null,
      prefecture: null,
      region: 'Tokyo',
      description_contains: null,
    });
  });

  it('クエリパラメータが欠けている場合はnullになる', () => {
    const query = new URLSearchParams('limit=10&region=Tokyo');
    
    const result = parseQueryParams(query);
    
    expect(result.limit).toBe(10);
    expect(result.offset).toBeNull();
    expect(result.region).toBe('Tokyo');
  });

  it('orderingは配列として処理される', () => {
    const query = new URLSearchParams();
    query.append('ordering', 'name');
    query.append('ordering', 'created_at');
    
    const result = parseQueryParams(query);
    
    expect(result.ordering).toEqual(['name', 'created_at']);
  });

  it('orderingのパラメータがない場合はnullになる', () => {
    const query = new URLSearchParams('limit=10');
    
    const result = parseQueryParams(query);
    
    expect(result.ordering).toBeNull();
  });

  it('数値パラメータは数値型に変換される', () => {
    const query = new URLSearchParams('limit=10&offset=20');
    
    const result = parseQueryParams(query);
    
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(20);
    expect(typeof result.limit).toBe('number');
    expect(typeof result.offset).toBe('number');
  });


}); 