import { DatabaseAdapter } from './types';
import { SQLiteAdapter } from './sqlite';
import { PostgresAdapter } from './postgres';

export async function createAdapter(): Promise<DatabaseAdapter> {
  const dbType = process.env.DATABASE_TYPE;
  let adapter: DatabaseAdapter;
  
  switch (dbType) {
    case 'postgres':
      adapter = new PostgresAdapter();
      break;
    case 'sqlite':
    default:
      adapter = new SQLiteAdapter();
  }
  
  await adapter.initialize();
  return adapter;
}

export type { DatabaseAdapter };
export { SQLiteAdapter, PostgresAdapter }; 