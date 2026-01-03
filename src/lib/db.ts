import { sql } from '@vercel/postgres';

export async function createTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      title TEXT,
      text TEXT,
      x INTEGER,
      y INTEGER,
      color TEXT,
      password TEXT, 
      is_locked BOOLEAN DEFAULT false,
      user_id TEXT, 
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}