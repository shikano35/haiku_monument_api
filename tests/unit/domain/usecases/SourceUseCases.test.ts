import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SourceQueryParams } from "../../../../src/domain/common/QueryParams";
import type {
  CreateSourceInput,
  Source,
  UpdateSourceInput,
} from "../../../../src/domain/entities/Source";
import type { ISourceRepository } from "../../../../src/domain/repositories/ISourceRepository";
import { SourceUseCases } from "../../../../src/domain/usecases/SourceUseCases";

describe("SourceUseCases", () => {
  let mockSourceRepo: ISourceRepository;
  let sourceUseCases: SourceUseCases;

  const now = new Date().toISOString();
  const sampleSources: Source[] = [
    {
      id: 1,
      citation: "奥の細道",
      title: "奥の細道",
      author: "松尾芭蕉",
      publisher: "江戸出版",
      sourceYear: 1702,
      url: "https://example.com/okuno-hosomichi",
      monuments: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      citation: "おらが春",
      title: "おらが春",
      author: "小林一茶",
      publisher: "江戸出版",
      sourceYear: 1819,
      url: "https://example.com/oraga-haru",
      monuments: null,
      createdAt: now,
      updatedAt: now,
    },
  ];

  beforeEach(() => {
    mockSourceRepo = {
      getAll: vi.fn(),
      getById: vi.fn(),
      getByTitle: vi.fn(),
      getByAuthor: vi.fn(),
      getByPublisher: vi.fn(),
      getByYear: vi.fn(),
      getByYearRange: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };

    sourceUseCases = new SourceUseCases(mockSourceRepo);
  });

  describe("getAllSources", () => {
    it("全ての出典を取得する", async () => {
      vi.mocked(mockSourceRepo.getAll).mockResolvedValue(sampleSources);

      const queryParams = {} as SourceQueryParams;
      const result = await sourceUseCases.getAllSources(queryParams);

      expect(mockSourceRepo.getAll).toHaveBeenCalledWith(queryParams);
      expect(result).toEqual(sampleSources);
    });
  });

  describe("getSourceById", () => {
    it("指定IDの出典が存在する場合、その出典を返す", async () => {
      vi.mocked(mockSourceRepo.getById).mockResolvedValue(sampleSources[0]);

      const result = await sourceUseCases.getSourceById(1);

      expect(mockSourceRepo.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(sampleSources[0]);
    });

    it("指定IDの出典が存在しない場合、nullを返す", async () => {
      vi.mocked(mockSourceRepo.getById).mockResolvedValue(null);

      const result = await sourceUseCases.getSourceById(999);

      expect(mockSourceRepo.getById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe("createSource", () => {
    it("新しい出典を作成する", async () => {
      const sourceInput: CreateSourceInput = {
        citation: "蕪村句集 - 与謝蕪村著, 江戸書店, 1775",
        title: "蕪村句集",
        author: "与謝蕪村",
        publisher: "江戸書店",
        sourceYear: 1775,
        url: "https://example.com/buson-kushu",
      };

      const createdSource: Source = {
        ...sourceInput,
        id: 3,
        monuments: null,
        createdAt: now,
        updatedAt: now,
      };

      vi.mocked(mockSourceRepo.create).mockResolvedValue(createdSource);

      const result = await sourceUseCases.createSource(sourceInput);

      expect(mockSourceRepo.create).toHaveBeenCalledWith(sourceInput);
      expect(result).toEqual(createdSource);
    });
  });

  describe("updateSource", () => {
    it("存在する出典を更新する", async () => {
      const updateData: UpdateSourceInput = {
        title: "更新された奥の細道",
        publisher: "改訂版出版社",
      };

      const updatedSource: Source = {
        ...sampleSources[0],
        title: "更新された奥の細道",
        publisher: "改訂版出版社",
        updatedAt: now,
      };

      vi.mocked(mockSourceRepo.update).mockResolvedValue(updatedSource);

      const result = await sourceUseCases.updateSource(1, updateData);

      expect(mockSourceRepo.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedSource);
    });

    it("存在しない出典を更新しようとした場合、nullを返す", async () => {
      const updateData: UpdateSourceInput = {
        title: "更新された奥の細道",
      };

      vi.mocked(mockSourceRepo.update).mockResolvedValue(null);

      const result = await sourceUseCases.updateSource(999, updateData);

      expect(mockSourceRepo.update).toHaveBeenCalledWith(999, updateData);
      expect(result).toBeNull();
    });
  });

  describe("deleteSource", () => {
    it("存在する出典を削除する", async () => {
      vi.mocked(mockSourceRepo.delete).mockResolvedValue(true);

      const result = await sourceUseCases.deleteSource(1);

      expect(mockSourceRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it("存在しない出典を削除しようとした場合、falseを返す", async () => {
      vi.mocked(mockSourceRepo.delete).mockResolvedValue(false);

      const result = await sourceUseCases.deleteSource(999);

      expect(mockSourceRepo.delete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });
});
