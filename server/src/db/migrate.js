import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigration(shouldClosePool = true) {
  console.log('🔄 Running database schema migration for CareConnect...');
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('✅ Database tables and indexes created successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    if (shouldClosePool) {
      await pool.end();
    }
  }
}

if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigration(true).catch(() => process.exit(1));
}

export default runMigration;

