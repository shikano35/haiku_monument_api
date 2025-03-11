import { HaikuMonumentUseCases } from '../../domain/usecases/HaikuMonumentUseCases';
import { LocationUseCases } from '../../domain/usecases/LocationUseCases';
import { PoetUseCases } from '../../domain/usecases/PoetUseCases';
import { SourceUseCases } from '../../domain/usecases/SourceUseCases';
import { HaikuMonumentRepository } from '../../infrastructure/repositories/HaikuMonumentRepository';
import { LocationRepository } from '../../infrastructure/repositories/LocationRepository';
import { PoetRepository } from '../../infrastructure/repositories/PoetRepository';
import { SourceRepository } from '../../infrastructure/repositories/SourceRepository';
import type { Env } from '../../types/env';

export function createUseCases(env: Env, domain: 'locations'): {
  locationUseCases: LocationUseCases;
  monumentUseCases: HaikuMonumentUseCases;
};
export function createUseCases(env: Env, domain: 'poets'): {
  poetUseCases: PoetUseCases;
  monumentUseCases: HaikuMonumentUseCases;
};
export function createUseCases(env: Env, domain: 'sources'): {
  sourceUseCases: SourceUseCases;
  monumentUseCases: HaikuMonumentUseCases;
};
export function createUseCases(env: Env, domain: 'haikuMonuments'): {
  monumentUseCases: HaikuMonumentUseCases;
};

export function createUseCases(
  env: Env,
  domain: 'locations' | 'poets' | 'sources' | 'haikuMonuments'
) {
  switch (domain) {
    case 'locations': {
      const locationRepo = new LocationRepository(env.DB);
      const monumentRepo = new HaikuMonumentRepository(env.DB);
      return {
        locationUseCases: new LocationUseCases(locationRepo),
        monumentUseCases: new HaikuMonumentUseCases(monumentRepo),
      };
    }
    case 'poets': {
      const poetRepo = new PoetRepository(env.DB);
      const monumentRepo = new HaikuMonumentRepository(env.DB);
      return {
        poetUseCases: new PoetUseCases(poetRepo),
        monumentUseCases: new HaikuMonumentUseCases(monumentRepo),
      };
    }
    case 'sources': {
      const sourceRepo = new SourceRepository(env.DB);
      const monumentRepo = new HaikuMonumentRepository(env.DB);
      return {
        sourceUseCases: new SourceUseCases(sourceRepo),
        monumentUseCases: new HaikuMonumentUseCases(monumentRepo),
      };
    }
    case 'haikuMonuments': {
      const monumentRepo = new HaikuMonumentRepository(env.DB);
      return { monumentUseCases: new HaikuMonumentUseCases(monumentRepo) };
    }
    default:
      throw new Error('Unknown domain');
  }
}
