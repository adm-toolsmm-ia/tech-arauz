/**
 * Repository exports and factory
 * @see Story 15.5 - Repository Implementation
 */

export type { IRepository, IRepositories } from './types';

export { BaseRepository } from './base-repository';
export { ProjetoRepository } from './projeto-repository';

import { ProjetoRepository } from './projeto-repository';

/**
 * Create all repository instances
 * Used as singleton in application
 */
export function createRepositories() {
  return {
    projeto: new ProjetoRepository(),
    // Additional repositories (entrega, cronograma, etc) can be added here
    // in future stories as they are implemented
  };
}
