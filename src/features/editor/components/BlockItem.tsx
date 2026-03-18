import React, { useRef, useEffect } from 'react';
import { Block, BlockType } from '../types/block.types';
import { clsx } from 'clsx';
import { GripVertical, Trash2, Type, Quote, HelpCircle, Hash, Info } from 'lucide-react';

interface BlockItemProps {
  block: Block;
  isActive: boolean;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onSelect: () => void;
  onChangeType: (type: BlockType) => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  isActive,
  onUpdate,
  onDelete,
  onSelect,
  onChangeType,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [block.content]);

  const getIcon = () => {
    switch (block.type) {
      case 'heading': return <Hash size={16} />;
      case 'quote': return <Quote size={16} />;
      case 'question': return <HelpCircle size={16} />;
      case 'note': return <Info size={16} />;
      case 'scripture': return <Book size={16} />;
      default: return <Type size={16} />;
    }
  };

  return (
    <div 
      className={clsx(
        "group relative flex items-start gap-2 py-1 px-4 rounded-lg transition-all",
        isActive ? "bg-slate-900/50" : "hover:bg-slate-900/30"
      )}
      onClick={onSelect}
    >
      <div className="mt-2 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
        <button className="cursor-grab text-slate-600 hover:text-slate-400">
          <GripVertical size={14} />
        </button>
      </div>

      <div className="mt-2 text-slate-600">
        {getIcon()}
      </div>

      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder={block.type === 'heading' ? 'Título...' : 'Digite algo...'}
          className={clsx(
            "w-full bg-transparent border-none outline-none resize-none py-1 text-slate-200 placeholder-slate-700 transition-all",
            block.type === 'heading' && "text-2xl font-bold tracking-tight",
            block.type === 'quote' && "italic border-l-2 border-indigo-500 pl-4 text-slate-400",
            block.type === 'note' && "text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700/50",
            block.type === 'question' && "text-indigo-300 font-medium",
            block.type === 'scripture' && "text-emerald-400 font-serif italic"
          )}
          rows={1}
        />
      </div>

      <div className="mt-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 hover:text-red-400 text-slate-600 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const Book = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
