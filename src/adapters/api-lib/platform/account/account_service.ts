import type { EntityDTO } from './entity';

export const accountServiceClient = {
  async ListEntity(..._args: unknown[]): Promise<{ data: { entities: EntityDTO[] } }> {
    return { data: { entities: [] } };
  },
};
