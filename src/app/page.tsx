import { createTable } from '@/lib/db';
import { getNotes, addNote } from './actions';
import StickyNote from '@/components/StickyNote';
import { PlusCircle } from 'lucide-react';

export default async function Home() {
  await createTable();
  const notes = await getNotes();

  return (
    <main className="min-h-screen bg-[#f8f9fa] relative flex flex-col md:flex-row">
      
      {/* BACKGROUND PATTERN (Dots) */}
      <div className="absolute inset-0 z-0 opacity-[0.4]" 
           style={{backgroundImage: 'radial-gradient(#a3a3a3 1.5px, transparent 1.5px)', backgroundSize: '24px 24px'}} 
      />

      {/* --- SIDEBAR / INPUT AREA --- */}
      <div className="z-10 w-full md:w-96 md:h-screen bg-white/90 backdrop-blur-md shadow-xl border-r border-gray-200 p-6 flex flex-col md:sticky md:top-0">
        <h1 className="font-extrabold text-3xl mb-6 text-gray-900 tracking-tight">
          Sticky<span className="text-yellow-500">Board</span>.
        </h1>
        
        <form action={addNote} className="flex flex-col gap-4 bg-white p-1 rounded-xl">
          <div className="relative">
            <textarea
              name="text"
              required
              placeholder="What's on your mind?"
              className="w-full p-4 border-2 border-gray-100 rounded-xl resize-none text-gray-700 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all bg-gray-50 min-h-[120px]"
            />
          </div>
          
          <div className="flex gap-2">
            <input 
              type="password"
              name="password"
              placeholder="Lock password (Optional)"
              className="w-full p-3 border-2 border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-blue-400 bg-gray-50"
            />
            <button
              type="submit"
              className="bg-black text-white px-6 rounded-xl hover:bg-gray-800 transition flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle size={20} />
            </button>
          </div>
        </form>

        <div className="mt-8 text-sm text-gray-500 space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="font-bold text-blue-800">How it works:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Mobile:</strong> View as a list.</li>
            <li><strong>Desktop:</strong> Drag notes around.</li>
            <li>Add a password to lock/protect a note.</li>
          </ul>
        </div>
      </div>

      {/* --- BOARD AREA --- */}
      <div className="relative flex-1 z-0 p-4 md:p-0 overflow-x-hidden md:overflow-auto">
        
        {/* MOBILE VIEW: Grid Layout */}
        <div className="md:hidden grid grid-cols-1 gap-4 pb-20">
          {notes.map((note) => (
             <StickyNote key={note.id} note={note} />
          ))}
          {notes.length === 0 && (
             <div className="text-center text-gray-400 mt-10">No notes yet. Add one above!</div>
          )}
        </div>

        {/* DESKTOP VIEW: Infinite Canvas */}
        <div className="hidden md:block w-[2000px] h-[2000px] relative">
          {notes.map((note) => (
            <StickyNote key={note.id} note={note} />
          ))}
        </div>
      </div>
    </main>
  );
}