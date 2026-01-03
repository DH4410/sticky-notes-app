import { sql } from '@vercel/postgres';

export async function createTable() {
  // We added 'title' and kept 'password'
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}