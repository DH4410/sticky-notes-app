'use client';

import React, { useState, useRef } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Lock, X, GripHorizontal } from 'lucide-react'; // Removed unused Unlock import
import { updateNotePosition, unlockNote, deleteNote, NoteData } from '@/app/actions';
import clsx from 'clsx';

export default function StickyNote({ note }: { note: NoteData }) {
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // FIX: Removed 'async' keyword here to satisfy TypeScript
  const handleStop = (e: DraggableEvent, data: DraggableData) => {
    setIsDragging(false);
    if (!note.is_locked) {
      // We call the server action here without 'await' so the function returns void, not a Promise
      updateNotePosition(note.id, data.x, data.y);
    }
  };

  const handleUnlock = async () => {
    if (!note.is_locked) return;
    const pwd = prompt("Enter password to unlock this note:") || "";
    const success = await unlockNote(note.id, pwd);
    if (!success) alert("Wrong password!");
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Delete this note?");
    if (!confirm) return;
    await deleteNote(note.id); 
  };

  const NoteCard = (
    <div
      ref={nodeRef}
      className={clsx(
        'relative w-full mb-4 md:mb-0 md:absolute md:w-72', 
        'p-5 shadow-lg rounded-lg transition-all duration-200',
        'flex flex-col gap-3',
        note.color,
        note.is_locked ? 'opacity-90 border-2 border-red-400/50' : 'hover:scale-[1.02]',
        isDragging && 'z-50 scale-110 shadow-2xl rotate-2',
        !note.is_locked && 'cursor-grab active:cursor-grabbing'
      )}
    >
      <div className="flex justify-between items-center pb-2 border-b border-black/5">
        <div className="flex gap-2">
          {note.is_locked ? (
            <button
              onClick={handleUnlock}
              className="bg-red-500/20 text-red-800 p-1.5 rounded-full hover:bg-red-500/30 transition"
              title="Locked (Click to Unlock)"
            >
              <Lock size={14} />
            </button>
          ) : (
             <div className="text-black/30">
               <GripHorizontal size={20} />
             </div>
          )}
        </div>
        
        {!note.is_locked && (
          <button
            onClick={handleDelete}
            className="text-black/40 hover:text-red-600 transition p-1"
            title="Delete Note"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      <p className="font-handwriting text-xl leading-relaxed text-gray-800 break-words whitespace-pre-wrap">
        {note.text}
      </p>

      <div className="text-[10px] text-black/40 font-sans font-bold uppercase tracking-wider flex justify-between">
         <span>{note.is_locked ? 'Read Only' : 'Editable'}</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block">
        <Draggable
          nodeRef={nodeRef}
          defaultPosition={{ x: note.x, y: note.y }}
          onStart={() => {
            if (note.is_locked) return false;
            setIsDragging(true);
          }}
          onStop={handleStop}
          disabled={note.is_locked}
        >
          {NoteCard}
        </Draggable>
      </div>

      <div className="block md:hidden">
        {NoteCard}
      </div>
    </>
  );
}