// src/components/StickyNote.tsx
'use client';

import React, { useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Lock, Unlock, X } from 'lucide-react';
import { updateNotePosition, unlockNote, deleteNote, NoteData } from '@/app/actions';
import clsx from 'clsx';

export default function StickyNote({ note }: { note: NoteData }) {
  const [isDragging, setIsDragging] = useState(false);

  // Fix: Explicitly type the event arguments for Draggable
  const handleStop = (e: DraggableEvent, data: DraggableData) => {
    setIsDragging(false);
    if (!note.is_locked) {
      void updateNotePosition(note.id, data.x, data.y);
    }
  };

  const handleUnlock = async () => {
    if (!note.is_locked) return;

    // Use browser prompt to get password
    const pwd = prompt("Enter password to unlock this note:") || "";
    const success = await unlockNote(note.id, pwd);
    
    if (!success) {
      alert("Wrong password!");
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this?");
    if (!confirm) return;

    // If it has a password, we might need it, but usually delete is hidden if locked
    await deleteNote(note.id); 
  };

  return (
    <Draggable
      defaultPosition={{ x: note.x, y: note.y }}
      // Fix: Types match now
      onStart={() => {
        if (note.is_locked) return false; // Return false stops drag
        setIsDragging(true);
      }}
      onStop={handleStop}
      disabled={note.is_locked}
    >
      <div
        className={clsx(
          'absolute w-64 p-4 shadow-lg rounded-sm cursor-grab active:cursor-grabbing transition-transform',
          note.color,
          note.is_locked && 'opacity-90 border-2 border-red-400 cursor-not-allowed',
          isDragging && 'z-50 scale-105'
        )}
      >
        <div className="flex justify-between items-start mb-2 border-b border-black/10 pb-2">
          {note.is_locked ? (
            <button
              onClick={handleUnlock}
              className="text-red-600 hover:text-red-800 flex gap-1 items-center text-xs font-bold"
              title="Unlock Note"
            >
              <Lock size={14} /> LOCKED
            </button>
          ) : (
            <div className="text-green-700 flex gap-1 items-center text-xs font-bold opacity-50">
               <Unlock size={14} /> OPEN
            </div>
          )}
          
          {!note.is_locked && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700"
              title="Delete Note"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <p className="whitespace-pre-wrap break-words text-gray-800 font-sans">
          {note.text}
        </p>
      </div>
    </Draggable>
  );
}