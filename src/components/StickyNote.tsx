'use client';

import React, { useState, useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Lock, X, GripHorizontal } from 'lucide-react';
import { updateNotePosition, unlockNote, deleteNote, NoteData } from '@/app/actions';
import clsx from 'clsx';

export default function StickyNote({ note }: { note: NoteData }) {
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleStop = (e: DraggableEvent, data: DraggableData) => {
    setIsDragging(false);
    if (!note.is_locked) {
      updateNotePosition(note.id, data.x, data.y);
    }
  };

  const handleUnlock = async () => {
    if (!note.is_locked) return;
    const pwd = prompt("Enter password to unlock:") || "";
    const success = await unlockNote(note.id, pwd);
    if (!success) alert("Wrong password!");
  };

  const handleDelete = async () => {
    if(!window.confirm("Delete this note?")) return;
    await deleteNote(note.id); 
  };

  const NoteCard = (
    <div
      ref={nodeRef}
      className={clsx(
        'relative w-full md:w-72 flex flex-col transition-all duration-200',
        // Style: Rounded corners, border to pop against grid, deep shadow
        'rounded-sm border-2 border-white/50',
        'shadow-[2px_4px_12px_rgba(0,0,0,0.1)]', 
        note.color,
        isDragging ? 'rotate-2 scale-105 z-50 shadow-2xl cursor-grabbing' : 'rotate-0',
        !note.is_locked && 'cursor-grab hover:-translate-y-1 hover:shadow-xl',
        note.is_locked && 'opacity-90 grayscale-[0.1] border-dashed border-slate-400'
      )}
    >
      {/* Tape Effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/20 rounded-full blur-[1px]"></div>
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-yellow-100/30 backdrop-blur-sm rotate-1 border-l border-r border-white/20"></div>

      {/* Header */}
      <div className="flex justify-between items-start p-3 pb-0 opacity-60 hover:opacity-100 transition-opacity">
         {note.is_locked ? (
            <button onClick={handleUnlock} className="text-red-800 bg-red-500/10 p-1 rounded hover:bg-red-500/20"><Lock size={12}/></button>
         ) : (
            <div className="text-black/40"><GripHorizontal size={16}/></div>
         )}
         {!note.is_locked && (
            <button onClick={handleDelete} className="text-black/40 hover:text-red-600 hover:bg-white/20 p-1 rounded"><X size={16}/></button>
         )}
      </div>

      {/* Content */}
      <div className="p-5 pt-2 font-handwriting min-h-[140px] flex flex-col">
        {note.title && (
          <h3 className="font-bold text-xl mb-2 leading-tight text-slate-900/90 border-b border-black/5 pb-1">{note.title}</h3>
        )}
        <p className="text-xl leading-relaxed text-slate-800/85 whitespace-pre-wrap break-words">{note.text}</p>
      </div>
      
      {/* Footer Status */}
      <div className="px-4 pb-2 text-[9px] font-bold text-black/20 uppercase tracking-widest text-right select-none">
        {note.is_locked ? 'Locked' : 'Sticky'}
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block">
        <Draggable
          nodeRef={nodeRef}
          defaultPosition={{ x: note.x, y: note.y }}
          onStart={() => { if (note.is_locked) return false; setIsDragging(true); }}
          onStop={handleStop}
          disabled={note.is_locked}
        >
          <div className="absolute">{NoteCard}</div>
        </Draggable>
      </div>
      <div className="block md:hidden mb-4">{NoteCard}</div>
    </>
  );
}