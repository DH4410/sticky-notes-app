// src/lib/db.ts
import { sql } from '@vercel/postgres';

export async function createTable() {
  // We add a 'password' column here
  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
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