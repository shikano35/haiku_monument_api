import { describe, it, expect, vi, beforeEach } from "vitest";
import { PoetUseCases } from "../../../../src/domain/usecases/PoetUseCases";
import type { IPoetRepository } from "../../../../src/domain/repositories/IPoetRepository";
import type {
  Poet,
  CreatePoetInput,
  UpdatePoetInput,
} from "../../../../src/domain/entities/Poet";
import type { PoetQueryParams } from "../../../../src/domain/common/QueryParams";

describe("PoetUseCases", () => {
  let mockPoetRepo: IPoetRepository;
  let poetUseCases: PoetUseCases;

  const samplePoets: Poet[] = [
    {
      id: 1,
      name: "松尾芭蕉",
      nameKana: "まつお ばしょう",
      biography: "江戸時代の俳人",
      birthYear: 1644,
      deathYear: 1694,
      linkUrl: "https://example.com/basho",
      imageUrl: "https://example.com/basho.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "与謝蕪村",
      nameKana: "よさ ぶそん",
      biography: "江戸時代中期の俳人",
      birthYear: 1716,
      deathYear: 1783,
      linkUrl: "https://example.com/buson",
      imageUrl: "https://example.com/buson.jpg",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    mockPoetRepo = {
      getAll: vi.fn(),
      getById: vi.fn(),
      getByName: vi.fn(),
      getByNameContains: vi.fn(),
      getByBirthYear: vi.fn(),
      getByBirthYearRange: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };

    poetUseCases = new PoetUseCases(mockPoetRepo);
  });

  describe("getAllPoets", () => {
    it("全ての俳人を取得する", async () => {
      vi.mocked(mockPoetRepo.getAll).mockResolvedValue(samplePoets);

      const queryParams = {} as PoetQueryParams;
      const result = await poetUseCases.getAllPoets(queryParams);

      expect(mockPoetRepo.getAll).toHaveBeenCalledWith(queryParams);
      expect(result).toEqual(samplePoets);
    });
  });

  describe("getPoetById", () => {
    it("指定IDの俳人が存在する場合、その俳人を返す", async () => {
      vi.mocked(mockPoetRepo.getById).mockResolvedValue(samplePoets[0]);

      const result = await poetUseCases.getPoetById(1);

      expect(mockPoetRepo.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(samplePoets[0]);
    });

    it("指定IDの俳人が存在しない場合、nullを返す", async () => {
      vi.mocked(mockPoetRepo.getById).mockResolvedValue(null);

      const result = await poetUseCases.getPoetById(999);

      expect(mockPoetRepo.getById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe("createPoet", () => {
    it("新しい俳人を作成する", async () => {
      const poetInput: CreatePoetInput = {
        name: "高浜虚子",
        nameKana: "たかはま きょし",
        biography: "明治から昭和の俳人",
        birthYear: 1874,
        deathYear: 1959,
        linkUrl: "https://example.com/kyoshi",
        imageUrl: "https://example.com/kyoshi.jpg",
      };

      const createdPoet: Poet = {
        ...poetInput,
        id: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(mockPoetRepo.create).mockResolvedValue(createdPoet);

      const result = await poetUseCases.createPoet(poetInput);

      expect(mockPoetRepo.create).toHaveBeenCalledWith(poetInput);
      expect(result).toEqual(createdPoet);
    });
  });

  describe("updatePoet", () => {
    it("存在する俳人を更新する", async () => {
      const updateData: UpdatePoetInput = {
        name: null,
        nameKana: null,
        biography: "更新された経歴",
        birthYear: null,
        deathYear: null,
        linkUrl: null,
        imageUrl: null,
      };

      const updatedPoet: Poet = {
        ...samplePoets[0],
        biography: "更新された経歴",
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(mockPoetRepo.update).mockResolvedValue(updatedPoet);

      const result = await poetUseCases.updatePoet(1, updateData);

      expect(mockPoetRepo.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedPoet);
    });

    it("存在しない俳人を更新しようとした場合、nullを返す", async () => {
      const updateData: UpdatePoetInput = {
        name: null,
        nameKana: null,
        biography: "更新された経歴",
        birthYear: null,
        deathYear: null,
        linkUrl: null,
        imageUrl: null,
      };

      vi.mocked(mockPoetRepo.update).mockResolvedValue(null);

      const result = await poetUseCases.updatePoet(999, updateData);

      expect(mockPoetRepo.update).toHaveBeenCalledWith(999, updateData);
      expect(result).toBeNull();
    });
  });

  describe("deletePoet", () => {
    it("存在する俳人を削除する", async () => {
      vi.mocked(mockPoetRepo.delete).mockResolvedValue(true);

      const result = await poetUseCases.deletePoet(1);

      expect(mockPoetRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it("存在しない俳人を削除しようとした場合、falseを返す", async () => {
      vi.mocked(mockPoetRepo.delete).mockResolvedValue(false);

      const result = await poetUseCases.deletePoet(999);

      expect(mockPoetRepo.delete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });
});
