'use client';

import React, { useState, useRef, useEffect } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Lock, X, GripHorizontal, Pencil, Check } from 'lucide-react';
import { updateNotePosition, unlockNote, deleteNote, updateNoteContent, NoteData } from '@/app/actions';
import clsx from 'clsx';

export default function StickyNote({ note }: { note: NoteData }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Track position locally
  const [position, setPosition] = useState({ x: note.x, y: note.y });
  
  // Track the last time we moved it to prevent "Snap Back"
  const lastDragTime = useRef(0);

  const [editTitle, setEditTitle] = useState(note.title || '');
  const [editText, setEditText] = useState(note.text || '');
  const nodeRef = useRef<HTMLDivElement>(null);

  // --- SYNC LOGIC ---
  useEffect(() => {
    // 1. If dragging, ignore server updates immediately.
    if (isDragging) return;

    // 2. If we moved this note less than 5 seconds ago, ignore server.
    // This gives the slow database time to save the new spot before we listen to it again.
    const timeSinceDrag = Date.now() - lastDragTime.current;
    if (timeSinceDrag < 5000) return;

    // 3. Only update if the position is actually different (prevents jitters)
    if (position.x !== note.x || position.y !== note.y) {
      setPosition({ x: note.x, y: note.y });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.x, note.y, isDragging]); 

  // --- DRAG HANDLERS ---
  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
    setPosition({ x: data.x, y: data.y });
  };

  const handleStop = (e: DraggableEvent, data: DraggableData) => {
    setIsDragging(false);
    lastDragTime.current = Date.now(); // Mark timestamp
    
    if (!note.is_locked) {
      updateNotePosition(note.id, data.x, data.y);
    }
  };

  const handleUnlock = async () => {
    if (!note.is_locked) return;
    const pwd = prompt("Enter password (or Admin Code) to unlock:") || "";
    const success = await unlockNote(note.id, pwd);
    if (!success) alert("Wrong password!");
  };

  const handleDelete = async () => {
    if(!window.confirm("Delete this note?")) return;
    await deleteNote(note.id); 
  };

  const handleSave = async () => {
    await updateNoteContent(note.id, editTitle, editText);
    setIsEditing(false);
  };

  const NoteCard = (
    <div
      ref={nodeRef}
      className={clsx(
        'relative w-full md:w-72 flex flex-col',
        'rounded-sm border-2 border-white/50 shadow-[2px_4px_12px_rgba(0,0,0,0.1)]', 
        note.color,
        
        // FIX: Removed "transition-all". We only animate shadow/scale/opacity.
        // We DO NOT animate top/left/transform during sync, or it feels laggy.
        'transition-[box-shadow,transform,opacity] duration-200',

        isDragging ? 'rotate-2 scale-105 z-50 shadow-2xl cursor-grabbing' : 'rotate-0',
        !note.is_locked && !isEditing && 'cursor-grab hover:-translate-y-1',
        note.is_locked && 'opacity-90 grayscale-[0.1] border-dashed border-slate-400'
      )}
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/20 rounded-full blur-[1px]"></div>
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-yellow-100/30 backdrop-blur-sm rotate-1 border-l border-r border-white/20"></div>

      <div className="flex justify-between items-start p-3 pb-0 opacity-60 hover:opacity-100 transition-opacity">
         {note.is_locked ? (
            <button onClick={handleUnlock} className="text-red-800 bg-red-500/10 p-1 rounded hover:bg-red-500/20"><Lock size={12}/></button>
         ) : (
            <div className="flex gap-2">
               <div className="text-black/40 cursor-grab"><GripHorizontal size={16}/></div>
               {isEditing ? (
                 <button onClick={handleSave} className="text-green-700 hover:bg-white/30 p-0.5 rounded"><Check size={16}/></button>
               ) : (
                 <button onClick={() => setIsEditing(true)} className="text-black/50 hover:text-black hover:bg-white/20 p-0.5 rounded"><Pencil size={14}/></button>
               )}
            </div>
         )}
         {!note.is_locked && (
            <button onClick={handleDelete} className="text-black/40 hover:text-red-600 hover:bg-white/20 p-1 rounded"><X size={16}/></button>
         )}
      </div>

      <div className="p-5 pt-2 font-handwriting min-h-[140px] flex flex-col">
        {isEditing ? (
          <>
            <input 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-white/40 border-b border-black/10 font-bold text-xl mb-2 p-1 focus:outline-none rounded"
              placeholder="Title..."
            />
            <textarea 
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="bg-white/40 flex-1 resize-none text-xl p-1 focus:outline-none rounded"
            />
            <button onClick={handleSave} className="mt-2 bg-black/10 hover:bg-black/20 text-xs py-1 rounded font-sans">Save Changes</button>
          </>
        ) : (
          <>
            {note.title && (
              <h3 className="font-bold text-xl mb-2 leading-tight text-slate-900/90 border-b border-black/5 pb-1 select-none">{note.title}</h3>
            )}
            <p className="text-xl leading-relaxed text-slate-800/85 whitespace-pre-wrap break-words select-none">{note.text}</p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block">
        <Draggable
          nodeRef={nodeRef}
          position={position}
          onDrag={handleDrag}
          onStart={() => { if (note.is_locked || isEditing) return false; setIsDragging(true); }}
          onStop={handleStop}
          disabled={note.is_locked || isEditing}
        >
          <div className="absolute">{NoteCard}</div>
        </Draggable>
      </div>
      <div className="block md:hidden mb-4">{NoteCard}</div>
    </>
  );
}