import { Pool } from 'pg';

// Поддержка двух способов подключения:
// 1. Через DATABASE_URL (приоритет)
// 2. Через отдельные параметры
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST || process.env.POSTGRES_HOST,
        port: parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT || '5432'),
        database: process.env.DB_NAME || process.env.POSTGRES_DB,
        user: process.env.DB_USER || process.env.POSTGRES_USER,
        password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
      }
);

// Автоматическое создание таблиц при первом подключении
const initDatabase = async () => {
  try {
    // Таблица пользователей
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Таблица сохранений прогресса
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_saves (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        scene_id VARCHAR(100) NOT NULL,
        dialogue_index INTEGER NOT NULL,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `);
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Инициализация при загрузке модуля
initDatabase();

export default pool;
