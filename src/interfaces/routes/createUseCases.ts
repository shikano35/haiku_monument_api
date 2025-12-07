import { drizzle } from "drizzle-orm/d1";
import { InscriptionUseCases } from "../../domain/usecases/InscriptionUseCases";
import { LocationUseCases } from "../../domain/usecases/LocationUseCases";
import { MonumentUseCases } from "../../domain/usecases/MonumentUseCases";
import { PoemUseCases } from "../../domain/usecases/PoemUseCases";
import { PoetUseCases } from "../../domain/usecases/PoetUseCases";
import { SourceUseCases } from "../../domain/usecases/SourceUseCases";
import { InscriptionRepository } from "../../infrastructure/repositories/InscriptionRepository";
import { LocationRepository } from "../../infrastructure/repositories/LocationRepository";
import { MonumentRepository } from "../../infrastructure/repositories/MonumentRepository";
import { PoemRepository } from "../../infrastructure/repositories/PoemRepository";
import { PoetRepository } from "../../infrastructure/repositories/PoetRepository";
import { SourceRepository } from "../../infrastructure/repositories/SourceRepository";
import type { Env } from "../../types/env";

export function createUseCases(
  env: Env,
  domain: "locations",
): {
  locationUseCases: LocationUseCases;
  monumentUseCases: MonumentUseCases;
};
export function createUseCases(
  env: Env,
  domain: "poets",
): {
  poetUseCases: PoetUseCases;
  monumentUseCases: MonumentUseCases;
};
export function createUseCases(
  env: Env,
  domain: "sources",
): {
  sourceUseCases: SourceUseCases;
  monumentUseCases: MonumentUseCases;
};
export function createUseCases(
  env: Env,
  domain: "monuments",
): {
  monumentUseCases: MonumentUseCases;
};
export function createUseCases(
  env: Env,
  domain: "inscriptions",
): {
  inscriptionUseCases: InscriptionUseCases;
};
export function createUseCases(
  env: Env,
  domain: "poems",
): {
  poemUseCases: PoemUseCases;
};

export function createUseCases(
  env: Env,
  domain:
    | "locations"
    | "poets"
    | "sources"
    | "monuments"
    | "inscriptions"
    | "poems",
) {
  switch (domain) {
    case "locations": {
      const locationRepo = new LocationRepository(env.DB);
      const monumentRepo = new MonumentRepository(env.DB, env.WORKERS_PLAN);
      return {
        locationUseCases: new LocationUseCases(locationRepo),
        monumentUseCases: new MonumentUseCases(monumentRepo),
      };
    }
    case "poets": {
      const poetRepo = new PoetRepository(env.DB);
      const monumentRepo = new MonumentRepository(env.DB, env.WORKERS_PLAN);
      return {
        poetUseCases: new PoetUseCases(poetRepo),
        monumentUseCases: new MonumentUseCases(monumentRepo),
      };
    }
    case "sources": {
      const sourceRepo = new SourceRepository(env.DB);
      const monumentRepo = new MonumentRepository(env.DB, env.WORKERS_PLAN);
      return {
        sourceUseCases: new SourceUseCases(sourceRepo),
        monumentUseCases: new MonumentUseCases(monumentRepo),
      };
    }
    case "monuments": {
      const monumentRepo = new MonumentRepository(env.DB, env.WORKERS_PLAN);
      return { monumentUseCases: new MonumentUseCases(monumentRepo) };
    }
    case "inscriptions": {
      const db = drizzle(env.DB);
      const inscriptionRepo = new InscriptionRepository(db);
      return { inscriptionUseCases: new InscriptionUseCases(inscriptionRepo) };
    }
    case "poems": {
      const db = drizzle(env.DB);
      const poemRepo = new PoemRepository(db);
      return { poemUseCases: new PoemUseCases(poemRepo) };
    }
    default:
      throw new Error("Unknown domain");
  }
}
