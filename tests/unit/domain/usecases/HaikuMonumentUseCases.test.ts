import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HaikuMonumentUseCases } from '../../../../src/domain/usecases/HaikuMonumentUseCases';
import type { IHaikuMonumentRepository } from '../../../../src/domain/repositories/IHaikuMonumentRepository';
import type { 
  HaikuMonument, 
  CreateHaikuMonumentInput,
  UpdateHaikuMonumentInput 
} from '../../../../src/domain/entities/HaikuMonument';
import type { QueryParams } from '../../../../src/domain/common/QueryParams';

describe('HaikuMonumentUseCases', () => {
  // モックリポジトリ
  let mockRepo: IHaikuMonumentRepository;
  let useCases: HaikuMonumentUseCases;
  
  const sampleHaikuMonuments: HaikuMonument[] = [
    {
      id: 1,
      inscription: '古池や蛙飛び込む水の音',
      commentary: '松尾芭蕉の代表的な句',
      kigo: '蛙',
      season: '春',
      isReliable: true,
      hasReverseInscription: false,
      material: '石',
      totalHeight: 150,
      width: 60,
      depth: 30,
      establishedDate: '1980-05-15',
      establishedYear: 1980,
      founder: '俳句協会',
      monumentType: '石碑',
      designationStatus: '市指定文化財',
      photoUrl: 'https://example.com/photo1.jpg',
      photoDate: '2020-06-01',
      photographer: '句碑写真家',
      model3dUrl: null,
      remarks: '東京都上野公園内に設置',
      poetId: 1,
      sourceId: 1,
      locationId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      inscription: '閑さや岩にしみ入る蝉の声',
      commentary: '松尾芭蕉の名句',
      kigo: '蝉',
      season: '夏',
      isReliable: true,
      hasReverseInscription: false,
      material: '石',
      totalHeight: 120,
      width: 50,
      depth: 25,
      establishedDate: '1985-08-10',
      establishedYear: 1985,
      founder: '地元住民',
      monumentType: '石碑',
      designationStatus: null,
      photoUrl: 'https://example.com/photo2.jpg',
      photoDate: '2021-07-15',
      photographer: '句碑写真家',
      model3dUrl: null,
      remarks: null,
      poetId: 1,
      sourceId: 1,
      locationId: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    mockRepo = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByPoetId: vi.fn(),
      getByLocationId: vi.fn(),
      getBySourceId: vi.fn(),
    };
    
    useCases = new HaikuMonumentUseCases(mockRepo);
  });

  describe('getAllHaikuMonuments', () => {
    it('すべての句碑を取得する', async () => {
      vi.mocked(mockRepo.getAll).mockResolvedValue(sampleHaikuMonuments);
      
      const queryParams = {} as QueryParams;
      const result = await useCases.getAllHaikuMonuments(queryParams);
      
      expect(mockRepo.getAll).toHaveBeenCalledWith(queryParams);
      expect(result).toEqual(sampleHaikuMonuments);
    });
  });

  describe('getHaikuMonumentById', () => {
    it('指定IDの句碑が存在する場合、その句碑を返す', async () => {
      vi.mocked(mockRepo.getById).mockResolvedValue(sampleHaikuMonuments[0]);
      
      const result = await useCases.getHaikuMonumentById(1);
      
      expect(mockRepo.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(sampleHaikuMonuments[0]);
    });

    it('指定IDの句碑が存在しない場合、nullを返す', async () => {
      vi.mocked(mockRepo.getById).mockResolvedValue(null);
      
      const result = await useCases.getHaikuMonumentById(999);
      
      expect(mockRepo.getById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('createHaikuMonument', () => {
    it('新しい句碑を作成する', async () => {
      const input: CreateHaikuMonumentInput = {
        inscription: '山路来て何やらゆかしすみれ草',
        commentary: '松尾芭蕉の句',
        poet: { id: 1 },
        source: { id: 1 },
        location: { id: 1 },
      };
      
      const createdMonument: HaikuMonument = {
        id: 3,
        inscription: '山路来て何やらゆかしすみれ草',
        commentary: '松尾芭蕉の句',
        kigo: null,
        season: null,
        isReliable: null,
        hasReverseInscription: null,
        material: null,
        totalHeight: null,
        width: null,
        depth: null,
        establishedDate: null,
        establishedYear: null,
        founder: null,
        monumentType: null,
        designationStatus: null,
        photoUrl: null,
        photoDate: null,
        photographer: null,
        model3dUrl: null,
        remarks: null,
        poetId: 1,
        sourceId: 1,
        locationId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      vi.mocked(mockRepo.create).mockResolvedValue(createdMonument);
      
      const result = await useCases.createHaikuMonument(input);
      
      expect(mockRepo.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(createdMonument);
    });
  });

  describe('updateHaikuMonument', () => {
    it('存在する句碑を更新する', async () => {
      const updateData: UpdateHaikuMonumentInput = {
        commentary: '更新された解説',
      };
      
      const updatedMonument = {
        ...sampleHaikuMonuments[0],
        commentary: '更新された解説',
        updatedAt: new Date().toISOString(),
      };
      
      vi.mocked(mockRepo.update).mockResolvedValue(updatedMonument);
      
      const result = await useCases.updateHaikuMonument(1, updateData);
      
      expect(mockRepo.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedMonument);
    });

    it('存在しない句碑を更新しようとした場合、nullを返す', async () => {
      const updateData: UpdateHaikuMonumentInput = {
        commentary: '更新された解説',
      };
      
      vi.mocked(mockRepo.update).mockResolvedValue(null);
      
      const result = await useCases.updateHaikuMonument(999, updateData);
      
      expect(mockRepo.update).toHaveBeenCalledWith(999, updateData);
      expect(result).toBeNull();
    });
  });

  describe('deleteHaikuMonument', () => {
    it('存在する句碑を削除する', async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(true);
      
      const result = await useCases.deleteHaikuMonument(1);
      
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('存在しない句碑を削除しようとした場合、falseを返す', async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(false);
      
      const result = await useCases.deleteHaikuMonument(999);
      
      expect(mockRepo.delete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });

  describe('getHaikuMonumentsByPoet', () => {
    it('指定された俳人の句碑を取得する', async () => {
      const poetId = 1;
      const expectedMonuments = sampleHaikuMonuments;
      
      vi.mocked(mockRepo.getByPoetId).mockResolvedValue(expectedMonuments);
      
      const result = await useCases.getHaikuMonumentsByPoet(poetId);
      
      expect(mockRepo.getByPoetId).toHaveBeenCalledWith(poetId);
      expect(result).toEqual(expectedMonuments);
    });
  });

  describe('getHaikuMonumentsByLocation', () => {
    it('指定された場所の句碑を取得する', async () => {
      const locationId = 1;
      const expectedMonuments = [sampleHaikuMonuments[0]];
      
      vi.mocked(mockRepo.getByLocationId).mockResolvedValue(expectedMonuments);
      
      const result = await useCases.getHaikuMonumentsByLocation(locationId);
      
      expect(mockRepo.getByLocationId).toHaveBeenCalledWith(locationId);
      expect(result).toEqual(expectedMonuments);
    });
  });

  describe('getHaikuMonumentsBySource', () => {
    it('指定された出典の句碑を取得する', async () => {
      const sourceId = 1;
      const expectedMonuments = sampleHaikuMonuments;
      
      vi.mocked(mockRepo.getBySourceId).mockResolvedValue(expectedMonuments);
      
      const result = await useCases.getHaikuMonumentsBySource(sourceId);
      
      expect(mockRepo.getBySourceId).toHaveBeenCalledWith(sourceId);
      expect(result).toEqual(expectedMonuments);
    });
  });
}); 