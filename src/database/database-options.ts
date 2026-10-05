import type { DataSourceOptions } from 'typeorm';
import type { DatabaseEnv } from '../config/env.schema.js';

export function createDatabaseOptions(env: DatabaseEnv): DataSourceOptions {
  const directory = import.meta.dirname.replaceAll('\\', '/');

  return {
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    schema: 'public',
    entities: [`${directory}/../**/*.entity.js`],
    migrations: [`${directory}/migrations/*.js`],
    synchronize: false,
    migrationsRun: false,
    installExtensions: false,
    uuidExtension: 'pgcrypto',
    logging: false,
    connectTimeoutMS: 5000,
  };
}
