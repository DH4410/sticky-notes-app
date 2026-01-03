'use client';

import React, { useEffect, useState } from 'react';
import StickyNote from './StickyNote';
import { NoteData } from '@/app/actions';
import { Users, Loader2 } from 'lucide-react';

export default function Board({ initialNotes }: { initialNotes: NoteData[] }) {
  const [notes, setNotes] = useState<NoteData[]>(initialNotes);
  const [onlineCount, setOnlineCount] = useState(1);
  const [loading, setLoading] = useState(false);

  // This effect runs every 2 seconds to sync data
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/sync');
        const data = await res.json();
        
        // Only update if data changed (simple check) to prevent flickering
        if (JSON.stringify(data.notes) !== JSON.stringify(notes)) {
           setNotes(data.notes);
        }
        setOnlineCount(data.onlineCount);
      } catch (e) {
        console.error("Sync error", e);
      }
    }, 2000); // 2 seconds

    return () => clearInterval(interval);
  }, [notes]); // Re-run if notes change locally to keep in sync

  return (
    <div className="flex-1 relative overflow-auto z-10 cursor-grab active:cursor-grabbing bg-grid-paper">
      
      {/* ONLINE COUNTER (Floating Top Right) */}
      <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur border border-slate-200 shadow-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-slate-600 animate-in fade-in">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        {onlineCount} Online
        <Users size={12} className="text-slate-400" />
      </div>

      {/* Mobile Grid */}
      <div className="md:hidden p-6 grid grid-cols-1 gap-4 pb-32">
         {notes.map((note) => <StickyNote key={note.id} note={note} />)}
         {notes.length === 0 && <p className="text-center text-slate-400 mt-10">Empty board.</p>}
      </div>

      {/* Desktop Infinite Canvas - BIGGER SIZE */}
      {/* Changed to 5000px as requested */}
      <div className="hidden md:block w-[5000px] h-[5000px] relative">
         {notes.map((note) => <StickyNote key={note.id} note={note} />)}
      </div>
    </div>
  );
}