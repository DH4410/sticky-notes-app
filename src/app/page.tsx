// src/app/page.tsx
import { createTable } from '@/lib/db';
import { getNotes, addNote } from './actions';
import StickyNote from '@/components/StickyNote';

export default async function Home() {
  // Ensure DB Table exists and fetch notes
  await createTable();
  const notes = await getNotes();

  return (
    <main className="min-h-screen bg-stone-100 overflow-hidden relative" 
          style={{backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
      
      {/* Header / Input Area */}
      <div className="fixed top-5 left-5 z-50 bg-white p-4 rounded-xl shadow-xl border border-stone-200 w-80">
        <h1 className="font-bold text-xl mb-2">Community Board</h1>
        <form action={addNote} className="flex flex-col gap-2">
          <textarea
            name="text"
            required
            placeholder="Write a note..."
            className="w-full p-2 border rounded resize-none text-black bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            rows={3}
          />
          <input 
            type="password"
            name="password"
            placeholder="Optional lock password"
            className="w-full p-2 border rounded text-sm text-black"
          />
          <button
            type="submit"
            className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition"
          >
            Post Note
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          * Anyone can read.
          <br/>
          * Set a password to prevent others from moving or editing your note.
          <br/>
          * Refresh to see friends&apos; updates. {/* Fixed typo here */}
        </p>
      </div>

      {/* The Board Area */}
      <div className="w-[2000px] h-[2000px] relative">
        {notes.map((note) => (
          <StickyNote key={note.id} note={note} />
        ))}
      </div>
    </main>
  );
}