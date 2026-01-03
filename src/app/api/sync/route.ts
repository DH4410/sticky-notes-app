import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'; // No caching

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    // If no user ID yet, just return data without tracking presence
    const notes = await sql`SELECT * FROM notes ORDER BY id ASC`;
    return NextResponse.json({ notes: notes.rows, onlineCount: 1 });
  }

  // 1. I AM HERE: Update my last_active time
  await sql`
    INSERT INTO presence (user_id, last_active) 
    VALUES (${userId}, NOW()) 
    ON CONFLICT (user_id) 
    DO UPDATE SET last_active = NOW()
  `;

  // 2. CLEAN UP: Remove people who haven't pinged in 30 seconds
  await sql`DELETE FROM presence WHERE last_active < NOW() - INTERVAL '30 seconds'`;

  // 3. COUNT: How many people are left?
  const countResult = await sql`SELECT COUNT(*) FROM presence`;
  const onlineCount = parseInt(countResult.rows[0].count);

  // 4. FETCH: Get latest notes
  const notesResult = await sql`SELECT * FROM notes ORDER BY id ASC`;

  return NextResponse.json({ 
    notes: notesResult.rows, 
    onlineCount: onlineCount 
  });
}