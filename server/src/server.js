import app from './app.js';
import dotenv from 'dotenv';
import pool from './config/database.js';
import { runMigration } from './db/migrate.js';
import { runSeed } from './db/seed.js';

dotenv.config();

const PORT = process.env.PORT || 5050;

async function startServer() {
  // In cloud deployment (e.g. Render / Railway with DATABASE_URL), auto-initialize if empty
  if (process.env.DATABASE_URL) {
    try {
      console.log('🔍 Verifying cloud database status...');
      const check = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'doctors'
        );
      `);
      
      if (!check.rows[0].exists) {
        console.log('🔄 First deployment run detected: Running automatic schema migration & seed...');
        await runMigration(false);
        await runSeed(false);
        console.log('✅ Database initialized successfully!');
      } else {
        console.log('✅ Database verified and ready.');
      }
    } catch (err) {
      console.warn('⚠️ Cloud database auto-setup notice:', err.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 CareConnect API Server is running on port ${PORT}`);
    console.log(`🩺 Health check accessible at /api/health`);
  });
}

startServer();
