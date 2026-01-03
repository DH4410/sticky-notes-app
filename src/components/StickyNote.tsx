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
        'relative w-full md:w-64 shadow-xl transition-all duration-200 flex flex-col',
        note.color, // Apply the color chosen from the form
        // Styling: a bit of rotation for realism if dragging
        isDragging ? 'rotate-3 scale-105 z-50 cursor-grabbing' : 'rotate-0',
        !note.is_locked && 'cursor-grab',
        // Lock styling
        note.is_locked && 'opacity-80 grayscale-[0.3] border-2 border-dashed border-stone-400'
      )}
      // Add a tape look at top
      style={{ boxShadow: '2px 4px 6px rgba(0,0,0,0.1)' }}
    >
      {/* Tape visual */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/30 backdrop-blur-sm rotate-1"></div>

      {/* Header */}
      <div className="flex justify-between items-start p-3 pb-0">
         {note.is_locked ? (
            <button onClick={handleUnlock} className="text-stone-600 hover:text-black"><Lock size={14}/></button>
         ) : (
            <div className="text-black/20"><GripHorizontal size={16}/></div>
         )}
         {!note.is_locked && (
            <button onClick={handleDelete} className="text-black/30 hover:text-red-600"><X size={16}/></button>
         )}
      </div>

      {/* Content */}
      <div className="p-4 pt-1 font-handwriting">
        {note.title && (
          <h3 className="font-bold text-lg mb-1 leading-tight text-black/90">{note.title}</h3>
        )}
        <p className="text-xl leading-snug text-black/80 whitespace-pre-wrap break-words">{note.text}</p>
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