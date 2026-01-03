import { createTable } from '@/lib/db';
import { getNotes, addNote } from './actions';
import Board from '@/components/Board'; // Import the new component
import { Plus, Lock, Palette, Type, AlignLeft } from 'lucide-react';
import { cookies } from 'next/headers';

export default async function Home() {
  await createTable();
  const notes = await getNotes();

  // Initialize cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  const colors = [
    { name: 'Yellow', value: 'bg-yellow-200' },
    { name: 'Blue', value: 'bg-cyan-200' },
    { name: 'Green', value: 'bg-green-300' },
    { name: 'Pink', value: 'bg-pink-300' },
    { name: 'Purple', value: 'bg-purple-300' },
    { name: 'Orange', value: 'bg-orange-300' },
  ];

  return (
    <main className="h-screen w-full bg-grid-paper flex flex-col md:flex-row overflow-hidden relative text-slate-800">

      {/* SIDEBAR */}
      <div className="z-30 w-full md:w-[350px] bg-white/80 backdrop-blur-xl border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col h-auto md:h-full transition-all">
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
          <div>
            <h1 className="font-extrabold text-2xl tracking-tighter text-slate-900 flex items-center gap-2">
              <span className="bg-yellow-400 w-3 h-3 rounded-full inline-block"></span>
              Stickies.
            </h1>
            <p className="text-slate-500 text-xs font-medium pl-5 mt-0.5">Collaborative Board</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form action={addNote} className="flex flex-col gap-6">
            <div className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded border border-slate-200">
               ⚠️ Limit: 3 Notes per person.
            </div>

            <div className="group">
              <label className="text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <Type size={12} /> Title
              </label>
              <input name="title" placeholder="Ex: Ideas" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" />
            </div>

            <div className="group">
               <label className="text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide"><AlignLeft size={12} /> Content</label>
              <textarea name="text" required placeholder="Write something..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 h-32 resize-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" />
            </div>

            <div>
               <label className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5 uppercase tracking-wide"><Palette size={12} /> Color</label>
               <div className="flex gap-3 flex-wrap bg-slate-50 p-3 rounded-xl border border-slate-100">
                 {colors.map((c) => (
                   <label key={c.value} className="cursor-pointer relative group">
                     <input type="radio" name="color" value={c.value} defaultChecked={c.name === 'Yellow'} className="peer sr-only" />
                     <div className={`w-8 h-8 rounded-full ${c.value} border-2 border-transparent peer-checked:border-slate-800 peer-checked:scale-110 transition-all shadow-sm group-hover:scale-105`}></div>
                   </label>
                 ))}
               </div>
            </div>

            <div>
               <label className="text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide"><Lock size={12} /> Password (Optional)</label>
              <input type="password" name="password" placeholder="Set a lock code" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:bg-white focus:ring-2 focus:ring-red-500/10 focus:border-red-400 outline-none transition-all" />
            </div>

            <button type="submit" className="mt-2 w-full bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
              <Plus size={18} strokeWidth={3} /> Create Sticky
            </button>
          </form>
        </div>
      </div>

      {/* LOAD THE BOARD (With Live Features) */}
      <Board initialNotes={notes} />
      
    </main>
  );
}