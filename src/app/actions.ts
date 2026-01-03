'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

export interface NoteData {
  id: number;
  title?: string; // New field
  text: string;
  x: number;
  y: number;
  color: string;
  is_locked: boolean;
  password?: string;
}

export async function getNotes(): Promise<NoteData[]> {
  const { rows } = await sql`SELECT * FROM notes ORDER BY id ASC`;
  return rows as unknown as NoteData[];
}

export async function addNote(formData: FormData) {
  const title = formData.get('title') as string;
  const text = formData.get('text') as string;
  const password = formData.get('password') as string;
  const color = formData.get('color') as string || 'bg-yellow-200'; // Get selected color
  
  const x = Math.floor(Math.random() * 100);
  const y = Math.floor(Math.random() * 100);
  
  const isLocked = !!password; 

  await sql`
    INSERT INTO notes (title, text, x, y, color, password, is_locked) 
    VALUES (${title}, ${text}, ${x}, ${y}, ${color}, ${password}, ${isLocked})
  `;
  revalidatePath('/');
}

export async function updateNotePosition(id: number, x: number, y: number) {
  await sql`UPDATE notes SET x=${x}, y=${y} WHERE id=${id} AND is_locked=false`;
  revalidatePath('/');
}

export async function unlockNote(id: number, userProvidedPassword?: string) {
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