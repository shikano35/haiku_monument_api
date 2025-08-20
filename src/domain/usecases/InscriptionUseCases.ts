import type { IInscriptionRepository } from "../repositories/IInscriptionRepository";
import type { InscriptionQueryParams } from "../common/QueryParams";
import type {
  Inscription,
  CreateInscriptionInput,
  UpdateInscriptionInput,
} from "../entities/Inscription";

export class InscriptionUseCases {
  constructor(private inscriptionRepository: IInscriptionRepository) {}

  async getAllInscriptions(
    queryParams: InscriptionQueryParams = {},
  ): Promise<Inscription[]> {
    return this.inscriptionRepository.getAll(queryParams);
  }

  async getInscriptionById(id: number): Promise<Inscription | null> {
    return this.inscriptionRepository.getById(id);
  }

  async getInscriptionsByMonument(monumentId: number): Promise<Inscription[]> {
    return this.inscriptionRepository.getByMonumentId(monumentId);
  }

  async createInscription(
    inscriptionData: CreateInscriptionInput,
  ): Promise<Inscription> {
    return this.inscriptionRepository.create(inscriptionData);
  }

  async updateInscription(
    id: number,
    inscriptionData: UpdateInscriptionInput,
  ): Promise<Inscription | null> {
    return this.inscriptionRepository.update(id, inscriptionData);
  }

  async deleteInscription(id: number): Promise<boolean> {
    return this.inscriptionRepository.delete(id);
  }

  async getInscriptionCount(): Promise<number> {
    return this.inscriptionRepository.count();
  }
}
