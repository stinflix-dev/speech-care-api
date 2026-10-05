import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { databaseEnvSchema } from '../config/env.schema.js';
import { createDatabaseOptions } from './database-options.js';

const env = databaseEnvSchema.parse(process.env);

export default new DataSource(createDatabaseOptions(env));
