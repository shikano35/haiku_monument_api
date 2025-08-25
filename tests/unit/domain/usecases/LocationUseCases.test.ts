import { describe, it, expect, vi, beforeEach } from "vitest";
import { LocationUseCases } from "../../../../src/domain/usecases/LocationUseCases";
import type { ILocationRepository } from "../../../../src/domain/repositories/ILocationRepository";
import type {
  Location,
  CreateLocationInput,
  UpdateLocationInput,
} from "../../../../src/domain/entities/Location";
import type { LocationQueryParams } from "../../../../src/domain/common/QueryParams";

describe("LocationUseCases", () => {
  let mockLocationRepo: ILocationRepository;
  let locationUseCases: LocationUseCases;

  const sampleLocations: Location[] = [
    {
      id: 1,
      imiPrefCode: "13",
      region: "関東",
      prefecture: "東京都",
      municipality: "台東区",
      address: "上野公園",
      placeName: "上野恩賜公園",
      latitude: 35.7153,
      longitude: 139.773,
      geohash: null,
      geomGeojson: null,
      accuracyM: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      imiPrefCode: "26",
      region: "関西",
      prefecture: "京都府",
      municipality: "京都市",
      address: null,
      placeName: "嵐山",
      latitude: 35.0117,
      longitude: 135.6685,
      geohash: null,
      geomGeojson: null,
      accuracyM: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    mockLocationRepo = {
      getAll: vi.fn(),
      getById: vi.fn(),
      getByPrefecture: vi.fn(),
      getByRegion: vi.fn(),
      getByCoordinates: vi.fn(),
      getByImiPrefCode: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      countByPrefecture: vi.fn(),
    };

    locationUseCases = new LocationUseCases(mockLocationRepo);
  });

  describe("getAllLocations", () => {
    it("全ての場所を取得する", async () => {
      vi.mocked(mockLocationRepo.getAll).mockResolvedValue(sampleLocations);

      const queryParams = {} as LocationQueryParams;
      const result = await locationUseCases.getAllLocations(queryParams);

      expect(mockLocationRepo.getAll).toHaveBeenCalledWith(queryParams);
      expect(result).toEqual(sampleLocations);
    });
  });

  describe("getLocationById", () => {
    it("指定IDの場所が存在する場合、その場所を返す", async () => {
      vi.mocked(mockLocationRepo.getById).mockResolvedValue(sampleLocations[0]);

      const result = await locationUseCases.getLocationById(1);

      expect(mockLocationRepo.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(sampleLocations[0]);
    });

    it("指定IDの場所が存在しない場合、nullを返す", async () => {
      vi.mocked(mockLocationRepo.getById).mockResolvedValue(null);

      const result = await locationUseCases.getLocationById(999);

      expect(mockLocationRepo.getById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe("createLocation", () => {
    it("新しい場所を作成する", async () => {
      const locationInput: CreateLocationInput = {
        imiPrefCode: "26",
        region: "近畿",
        prefecture: "京都府",
        municipality: "京都市",
        address: "嵐山",
        placeName: "渡月橋",
        latitude: 35.0116,
        longitude: 135.6781,
        geohash: null,
        geomGeojson: null,
        accuracyM: null,
      };

      const createdLocation: Location = {
        ...locationInput,
        id: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(mockLocationRepo.create).mockResolvedValue(createdLocation);

      const result = await locationUseCases.createLocation(locationInput);

      expect(mockLocationRepo.create).toHaveBeenCalledWith(locationInput);
      expect(result).toEqual(createdLocation);
    });
  });

  describe("updateLocation", () => {
    it("存在する場所を更新する", async () => {
      const updateData: UpdateLocationInput = {
        imiPrefCode: null,
        region: null,
        prefecture: null,
        municipality: null,
        address: null,
        placeName: "更新された場所名",
        latitude: null,
        longitude: null,
        geohash: null,
        geomGeojson: null,
        accuracyM: null,
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

    it("存在しない場所を更新しようとした場合、nullを返す", async () => {
      const updateData: UpdateLocationInput = {
        imiPrefCode: null,
        region: null,
        prefecture: null,
        municipality: null,
        address: null,
        placeName: "更新された場所名",
        latitude: null,
        longitude: null,
        geohash: null,
        geomGeojson: null,
        accuracyM: null,
      };

      vi.mocked(mockLocationRepo.update).mockResolvedValue(null);

      const result = await locationUseCases.updateLocation(999, updateData);

      expect(mockLocationRepo.update).toHaveBeenCalledWith(999, updateData);
      expect(result).toBeNull();
    });
  });

  describe("deleteLocation", () => {
    it("存在する場所を削除する", async () => {
      vi.mocked(mockLocationRepo.delete).mockResolvedValue(true);

      const result = await locationUseCases.deleteLocation(1);

      expect(mockLocationRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it("存在しない場所を削除しようとした場合、falseを返す", async () => {
      vi.mocked(mockLocationRepo.delete).mockResolvedValue(false);

      const result = await locationUseCases.deleteLocation(999);

      expect(mockLocationRepo.delete).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });
});
