'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// Master Password from Vercel Env
const ADMIN_PWD = process.env.ADMIN_PASSWORD;

export interface NoteData {
  id: number;
  title?: string;
  text: string;
  x: number;
  y: number;
  color: string;
  is_locked: boolean;
  password?: string;
  user_id?: string;
}

export async function getNotes(): Promise<NoteData[]> {
  const { rows } = await sql`SELECT * FROM notes ORDER BY id ASC`;
  return rows as unknown as NoteData[];
}

export async function addNote(formData: FormData) {
  const cookieStore = await cookies();
  let userId = cookieStore.get('user_id')?.value;
  
  // If no user ID, create one
  if (!userId) {
    userId = crypto.randomUUID();
    cookieStore.set('user_id', userId);
  }

  const title = formData.get('title') as string;
  const text = formData.get('text') as string;
  const password = formData.get('password') as string;
  const color = formData.get('color') as string || 'bg-yellow-200';
  
  // --- LIMIT CHECK ---
  // 1. Check how many notes this user has
  const countResult = await sql`SELECT COUNT(*) FROM notes WHERE user_id=${userId}`;
  const count = parseInt(countResult.rows[0].count);

  // 2. Check if the provided password matches the ADMIN password
  const isAdmin = password === ADMIN_PWD;

  // 3. If user has 3+ notes and IS NOT admin, block them
  if (count >= 3 && !isAdmin) {
    // We can't easily alert from server action, so we just don't add it.
    // Ideally, we'd return an error state, but for now we just stop.
    return; 
  }

  const x = Math.floor(Math.random() * 100);
  const y = Math.floor(Math.random() * 100);
  const isLocked = !!password; 

  await sql`
    INSERT INTO notes (title, text, x, y, color, password, is_locked, user_id) 
    VALUES (${title}, ${text}, ${x}, ${y}, ${color}, ${password}, ${isLocked}, ${userId})
  `;
  revalidatePath('/');
}

export async function updateNotePosition(id: number, x: number, y: number) {
  await sql`UPDATE notes SET x=${x}, y=${y} WHERE id=${id} AND is_locked=false`;
  revalidatePath('/');
}

// NEW: Edit Text
export async function updateNoteContent(id: number, newTitle: string, newText: string) {
  await sql`UPDATE notes SET title=${newTitle}, text=${newText} WHERE id=${id} AND is_locked=false`;
  revalidatePath('/');
}

export async function unlockNote(id: number, userProvidedPassword?: string) {
  // 1. If user typed the Master Admin Password, unlock immediately
  if (userProvidedPassword === ADMIN_PWD) {
    await sql`UPDATE notes SET is_locked=false WHERE id=${id}`;
    revalidatePath('/');
    return true;
  }

  // 2. Otherwise check specific note password
  const { rows } = await sql`SELECT password FROM notes WHERE id=${id}`;
  if (rows.length === 0) return false;
  const dbPassword = rows[0].password;

  if (!dbPassword || dbPassword === '' || dbPassword === userProvidedPassword) {
    await sql`UPDATE notes SET is_locked=false WHERE id=${id}`;
    revalidatePath('/');
    return true;
  }
  return false;
}

export async function deleteNote(id: number) {
  await sql`DELETE FROM notes WHERE id=${id}`;
  revalidatePath('/');
}