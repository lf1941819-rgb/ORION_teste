import React from 'react';
import { clsx } from 'clsx';
import { Lightbulb, FileText, GitBranch, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { GraphNodeData } from '../types';

interface GraphNodeProps {
  node: GraphNodeData;
  isSelected: boolean;
  isFocused: boolean;
  onClick: () => void;
}

export const GraphNode: React.FC<GraphNodeProps> = ({ node, isSelected, isFocused, onClick }) => {
  const Icon = {
    idea: Lightbulb,
    premise: FileText,
    argument: GitBranch,
    conclusion: Info,
    objection: Info,
    counterargument: Info,
    reference: Info,
  }[node.type] || Info;

  const typeColors = {
    idea: 'bg-slate-900 border-indigo-500/30 text-indigo-50',
    premise: 'bg-slate-900 border-slate-700 text-slate-300',
    argument: 'bg-slate-900 border-emerald-500/30 text-emerald-50',
    conclusion: 'bg-slate-900 border-blue-500/30 text-blue-50',
    objection: 'bg-slate-900 border-rose-500/30 text-rose-50',
    counterargument: 'bg-slate-900 border-orange-500/30 text-orange-50',
    reference: 'bg-slate-900 border-amber-500/30 text-amber-50',
  };

  const accentColors = {
    idea: 'text-indigo-400 bg-indigo-500/10',
    premise: 'text-slate-400 bg-slate-500/10',
    argument: 'text-emerald-400 bg-emerald-500/10',
    conclusion: 'text-blue-400 bg-blue-500/10',
    objection: 'text-rose-400 bg-rose-500/10',
    counterargument: 'text-orange-400 bg-orange-500/10',
    reference: 'text-amber-400 bg-amber-500/10',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isFocused ? 1 : 0.15, 
        scale: isSelected ? 1.02 : 1,
        filter: isFocused ? 'blur(0px)' : 'blur(2px) grayscale(1)',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ 
        left: node.x, 
        top: node.y,
        transform: `translate(-50%, -50%)`,
      }}
      className={clsx(
        "absolute w-64 p-5 rounded-xl border shadow-2xl transition-all duration-500 cursor-pointer group z-20",
        typeColors[node.type],
        isSelected ? "ring-1 ring-white/20 border-white/40 shadow-[0_0_40px_rgba(0,0,0,0.8)]" : "hover:border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={clsx("p-1.5 rounded-md", accentColors[node.type])}>
            <Icon size={14} strokeWidth={2.5} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
            {node.type}
          </span>
        </div>
        {isSelected && (
          <motion.div 
            layoutId={`pulse-${node.id}`}
            className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}
      </div>
      
      <h3 className="text-[13px] font-bold leading-tight mb-2.5 group-hover:text-white transition-colors tracking-tight">
        {node.label}
      </h3>
      
      {node.description && (
        <p className="text-[10px] leading-relaxed opacity-40 line-clamp-2 font-medium">
          {node.description}
        </p>
      )}
    </motion.div>
  );
};
