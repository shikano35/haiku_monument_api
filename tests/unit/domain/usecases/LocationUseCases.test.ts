import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocationUseCases } from '../../../../src/domain/usecases/LocationUseCases';
import type { ILocationRepository } from '../../../../src/domain/repositories/ILocationRepository';
import type { Location, CreateLocationInput } from '../../../../src/domain/entities/Location';
import type { QueryParams } from '../../../../src/domain/common/QueryParams';

describe('LocationUseCases', () => {
  let mockLocationRepo: ILocationRepository;
  let locationUseCases: LocationUseCases;
  
  const sampleLocations: Location[] = [
    {
      id: 1,
      region: '関東',
      prefecture: '東京都',
      municipality: '台東区',
      address: '上野公園',
      placeName: '上野恩賜公園',
      latitude: 35.7153,
      longitude: 139.7730,
    },
    {
      id: 2,
      region: '中部',
      prefecture: '長野県',
      municipality: '長野市',
      address: null,
      placeName: '一茶記念館',
      latitude: 36.6486,
      longitude: 138.1950,
    },
  ];

  beforeEach(() => {
    mockLocationRepo = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    
    locationUseCases = new LocationUseCases(mockLocationRepo);
  });

  describe('getAllLocations', () => {
    it('全ての場所を取得する', async () => {
      vi.mocked(mockLocationRepo.getAll).mockResolvedValue(sampleLocations);
      
      const queryParams = {} as QueryParams;
      const result = await locationUseCases.getAllLocations(queryParams);
      
      expect(mockLocationRepo.getAll).toHaveBeenCalledWith(queryParams);
      expect(result).toEqual(sampleLocations);
    });
  });

  describe('getLocationById', () => {
    it('指定IDの場所が存在する場合、その場所を返す', async () => {
      vi.mocked(mockLocationRepo.getById).mockResolvedValue(sampleLocations[0]);
      
      const result = await locationUseCases.getLocationById(1);
      
      expect(mockLocationRepo.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(sampleLocations[0]);
    });

    it('指定IDの場所が存在しない場合、nullを返す', async () => {
      vi.mocked(mockLocationRepo.getById).mockResolvedValue(null);
      
      const result = await locationUseCases.getLocationById(999);
      
      expect(mockLocationRepo.getById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('createLocation', () => {
    it('新しい場所を作成する', async () => {
      const locationInput: CreateLocationInput = {
        region: '近畿',
        prefecture: '京都府',
        municipality: '京都市',
        address: '嵐山',
        placeName: '渡月橋',
        latitude: 35.0116,
        longitude: 135.6781,
      };
      
      const createdLocation: Location = {
        ...locationInput,
        id: 3,
      };
      
      vi.mocked(mockLocationRepo.create).mockResolvedValue(createdLocation);
      
      const result = await locationUseCases.createLocation(locationInput);
      
      expect(mockLocationRepo.create).toHaveBeenCalledWith(locationInput);
      expect(result).toEqual(createdLocation);
    });
  });

  describe('updateLocation', () => {
    it('存在する場所を更新する', async () => {
      const updateData = {
        placeName: '更新された場所名',
      };
      
      const updatedLocation = {
        ...sampleLocations[0],
        ...updateData,
      };
      
      vi.mocked(mockLocationRepo.update).mockResolvedValue(updatedLocation);
      
      const result = await locationUseCases.updateLocation(1, updateData);
      
      expect(mockLocationRepo.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedLocation);
    });

    it('存在しない場所を更新しようとした場合、nullを返す', async () => {
      const updateData = {
        placeName: '更新された場所名',
      };
      
      vi.mocked(mockLocationRepo.update).mockResolvedValue(null);
      
      const result = await locationUseCases.updateLocation(999, updateData);
      
      expect(mockLocationRepo.update).toHaveBeenCalledWith(999, updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteLocation', () => {
    it('存在する場所を削除する', async () => {
      vi.mocked(mockLocationRepo.delete).mockResolvedValue(true);
      
      const result = await locationUseCases.deleteLocation(1);
      
      expect(mockLocationRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('存在しない場所を削除しようとした場合、falseを返す', async () => {
      vi.mocked(mockLocationRepo.delete).mockResolvedValue(false);
      
      const result = await locationUseCases.deleteLocation(999);
      
      expect(mockLocationRepo.delete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });
}); 