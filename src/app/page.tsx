import { createTable } from '@/lib/db';
import { getNotes, addNote } from './actions';
import StickyNote from '@/components/StickyNote';
import { Plus, Lock } from 'lucide-react';

export default async function Home() {
  await createTable();
  const notes = await getNotes();

  const colors = [
    { name: 'Yellow', value: 'bg-yellow-200' },
    { name: 'Blue', value: 'bg-cyan-200' },
    { name: 'Green', value: 'bg-green-300' },
    { name: 'Pink', value: 'bg-pink-300' },
    { name: 'Purple', value: 'bg-purple-300' },
    { name: 'Orange', value: 'bg-orange-300' },
  ];

  return (
    <main className="min-h-screen bg-stone-100 relative flex flex-col md:flex-row overflow-hidden">
      
      {/* Background Dots */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}} 
      />

      {/* --- SIDEBAR FORM --- */}
      <div className="z-20 w-full md:w-80 bg-white border-r border-stone-200 shadow-2xl flex flex-col md:h-screen">
        <div className="p-6 bg-stone-900 text-white">
          <h1 className="font-bold text-2xl tracking-tight">Stickies.</h1>
          <p className="text-stone-400 text-xs mt-1">Shared Board</p>
        </div>
        
        <form action={addNote} className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
          
          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-500 ">Title</label>
            <input
              name="title"
              placeholder="Meeting Notes"
              className="w-full p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-stone-400 outline-none font-bold"
            />
          </div>

          {/* Content Input */}
          <div className="space-y-1">
             <label className="text-xs font-bold text-stone-500 ">Content</label>
            <textarea
              name="text"
              required
              placeholder="Don't forget to..."
              className="w-full p-2 border border-stone-300 rounded-md h-32 resize-none focus:ring-2 focus:ring-stone-400 outline-none"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-1">
             <label className="text-xs font-bold text-stone-500 ">Color</label>
             <div className="flex gap-2 flex-wrap">
               {colors.map((c) => (
                 <label key={c.value} className="cursor-pointer relative">
                   <input type="radio" name="color" value={c.value} defaultChecked={c.name === 'Yellow'} className="peer sr-only" />
                   <div className={`w-8 h-8 rounded-full ${c.value} border-2 border-transparent peer-checked:border-black peer-checked:scale-110 transition-all shadow-sm`}></div>
                 </label>
               ))}
             </div>
          </div>

          {/* Password */}
          <div className="space-y-1 pt-4 border-t border-stone-100">
             <label className="text-xs font-bold text-stone-500  flex items-center gap-1">
               <Lock size={12} /> Password (Optional)
             </label>
            <input
              type="password"
              name="password"
              placeholder="Secret123"
              className="w-full p-2 border border-stone-300 rounded-md text-sm bg-stone-50"
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-stone-900 text-white py-3 rounded-md font-bold hover:bg-black transition flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Sticky
          </button>
        </form>
      </div>

      {/* --- BOARD AREA --- */}
      <div className="relative flex-1 bg-stone-100 overflow-hidden">
        {/* Mobile: Scrollable List */}
        <div className="md:hidden h-full overflow-y-auto p-4 space-y-4">
           {notes.map((note) => <StickyNote key={note.id} note={note} />)}
           <div className="h-20"></div> {/* Spacer */}
        </div>

        {/* Desktop: Canvas */}
        <div className="hidden md:block w-full h-full overflow-auto">
           <div className="w-[2000px] h-[2000px] relative">
              {notes.map((note) => <StickyNote key={note.id} note={note} />)}
           </div>
        </div>
      </div>
    </main>
  );
}