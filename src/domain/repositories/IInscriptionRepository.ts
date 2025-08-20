import type {
  Inscription,
  CreateInscriptionInput,
  UpdateInscriptionInput,
} from "../entities/Inscription";
import type { InscriptionQueryParams } from "../common/QueryParams";

export interface IInscriptionRepository {
  getAll(queryParams?: InscriptionQueryParams): Promise<Inscription[]>;
  getById(id: number): Promise<Inscription | null>;
  getByMonumentId(monumentId: number): Promise<Inscription[]>;
  create(inscriptionData: CreateInscriptionInput): Promise<Inscription>;
  update(
    id: number,
    inscriptionData: UpdateInscriptionInput,
  ): Promise<Inscription | null>;
  delete(id: number): Promise<boolean>;
  count(): Promise<number>;
}
