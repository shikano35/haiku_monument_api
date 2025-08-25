import type { Poet, CreatePoetInput, UpdatePoetInput } from "../entities/Poet";
import type { PoetQueryParams } from "../common/QueryParams";

export interface IPoetRepository {
  getAll(queryParams?: PoetQueryParams): Promise<Poet[]>;
  getById(id: number): Promise<Poet | null>;
  getByName(name: string): Promise<Poet[]>;
  getByNameContains(nameFragment: string): Promise<Poet[]>;
  getByBirthYear(birthYear: number): Promise<Poet[]>;
  getByBirthYearRange(startYear: number, endYear: number): Promise<Poet[]>;
  create(poet: CreatePoetInput): Promise<Poet>;
  update(id: number, poetData: UpdatePoetInput): Promise<Poet | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
}
