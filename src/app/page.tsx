import { createTable } from '@/lib/db';
import { getNotes, addNote } from './actions';
import StickyNote from '@/components/StickyNote';
import { Plus, Lock, Palette, Type, AlignLeft } from 'lucide-react';

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
    // FIX: h-screen ensures it takes full height. bg-grid-paper is fixed everywhere.
    <main className="h-screen w-full bg-grid-paper flex flex-col md:flex-row overflow-hidden relative text-slate-800">

      {/* --- SIDEBAR (Modern Glass Panel) --- */}
      <div className="z-30 w-full md:w-[350px] bg-white/80 backdrop-blur-xl border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col h-auto md:h-full transition-all">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
          <div>
            <h1 className="font-extrabold text-2xl tracking-tighter text-slate-900 flex items-center gap-2">
              <span className="bg-yellow-400 w-3 h-3 rounded-full inline-block"></span>
              Stickies.
            </h1>
            <p className="text-slate-500 text-xs font-medium pl-5 mt-0.5">Collaborative Board</p>
          </div>
        </div>
        
        {/* Form Container */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form action={addNote} className="flex flex-col gap-6">
            
            {/* Title Input */}
            <div className="group">
              <label className="text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <Type size={12} /> Title
              </label>
              <input
                name="title"
                placeholder="Ex: Groceries"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Content Input */}
            <div className="group">
               <label className="text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                 <AlignLeft size={12} /> Content
               </label>
              <textarea
                name="text"
                required
                placeholder="What's on your mind today?"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 h-32 resize-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Color Picker */}
            <div>
               <label className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                 <Palette size={12} /> Color
               </label>
               <div className="flex gap-3 flex-wrap bg-slate-50 p-3 rounded-xl border border-slate-100">
                 {colors.map((c) => (
                   <label key={c.value} className="cursor-pointer relative group">
                     <input type="radio" name="color" value={c.value} defaultChecked={c.name === 'Yellow'} className="peer sr-only" />
                     <div className={`w-8 h-8 rounded-full ${c.value} border-2 border-transparent peer-checked:border-slate-800 peer-checked:scale-110 transition-all shadow-sm group-hover:scale-105`}></div>
                   </label>
                 ))}
               </div>
            </div>

            {/* Password */}
            <div>
               <label className="text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                 <Lock size={12} /> Password (Optional)
               </label>
              <input
                type="password"
                name="password"
                placeholder="Set a lock code"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-400 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} strokeWidth={3} /> Create Sticky
            </button>
          </form>
        </div>
      </div>

      {/* --- BOARD AREA (Infinite Scroll) --- */}
      {/* This area scrolls independently, preserving the grid background */}
      <div className="flex-1 relative overflow-auto z-10 cursor-grab active:cursor-grabbing">
        
        {/* Mobile: Grid View */}
        <div className="md:hidden p-6 grid grid-cols-1 gap-4 pb-32">
           {notes.map((note) => <StickyNote key={note.id} note={note} />)}
           {notes.length === 0 && <p className="text-center text-slate-400 mt-10">Empty board.</p>}
        </div>

        {/* Desktop: Infinite Canvas */}
        <div className="hidden md:block w-[3000px] h-[3000px] relative">
           {notes.map((note) => <StickyNote key={note.id} note={note} />)}
        </div>
      </div>
    </main>
  );
}