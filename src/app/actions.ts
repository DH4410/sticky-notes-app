// src/app/actions.ts
'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

// Define the shape of a Note to fix Type errors
export interface NoteData {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  is_locked: boolean;
  password?: string; // Optional password
}

export async function getNotes(): Promise<NoteData[]> {
  const { rows } = await sql`SELECT * FROM notes ORDER BY id ASC`;
  // We cast the result to our NoteData type
  return rows as unknown as NoteData[];
}

export async function addNote(formData: FormData) {
  const text = formData.get('text') as string;
  const password = formData.get('password') as string; // Get password from form
  
  const x = Math.floor(Math.random() * 200);
  const y = Math.floor(Math.random() * 200);
  const colors = ['bg-yellow-200', 'bg-blue-200', 'bg-green-200', 'bg-pink-200', 'bg-purple-200'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  // If a password is set, we start it as 'locked'
  const isLocked = !!password; 

  await sql`
    INSERT INTO notes (text, x, y, color, password, is_locked) 
    VALUES (${text}, ${x}, ${y}, ${color}, ${password}, ${isLocked})
  `;
  revalidatePath('/');
}

// Returns true if success, false if password wrong
export async function updateNotePosition(id: number, x: number, y: number) {
  // Only update if it is NOT locked
  await sql`UPDATE notes SET x=${x}, y=${y} WHERE id=${id} AND is_locked=false`;
  revalidatePath('/');
}

export async function unlockNote(id: number, userProvidedPassword?: string) {
  // Check if password matches in DB
  const { rows } = await sql`SELECT password FROM notes WHERE id=${id}`;
  if (rows.length === 0) return false;

  const dbPassword = rows[0].password;

  // If there is no password set on the note, anyone can toggle it
  if (!dbPassword || dbPassword === '') {
    await sql`UPDATE notes SET is_locked=false WHERE id=${id}`;
    revalidatePath('/');
    return true;
  }

  // If password matches
  if (dbPassword === userProvidedPassword) {
    await sql`UPDATE notes SET is_locked=false WHERE id=${id}`;
    revalidatePath('/');
    return true;
  }

  return false; // Wrong password
}

export async function deleteNote(id: number, userProvidedPassword?: string) {
  const { rows } = await sql`SELECT password FROM notes WHERE id=${id}`;
  if (rows.length === 0) return;
  const dbPassword = rows[0].password;

  if (!dbPassword || dbPassword === userProvidedPassword) {
    await sql`DELETE FROM notes WHERE id=${id}`;
    revalidatePath('/');
    return true;
  }
  return false;
}