import React from 'react';
import { X, Tag, Link2, Calendar, User, MessageSquare, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GraphNodeData } from '../types';

interface GraphInspectorPanelProps {
  node: GraphNodeData | null;
  onClose: () => void;
}

export const GraphInspectorPanel: React.FC<GraphInspectorPanelProps> = ({ node, onClose }) => {
  return (
    <AnimatePresence>
      {node && (
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-slate-950/90 backdrop-blur-3xl border-l border-white/5 shadow-[-40px_0_80px_rgba(0,0,0,0.8)] z-[60] flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/5">
                <Tag size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Inspector</h2>
                <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-black">Analytical Data</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {/* Type Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-8">
              <span className="w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.8)]" />
              {node.type}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              {node.label}
            </h1>

            {/* Description */}
            <div className="mb-10">
              <h4 className="text-[9px] uppercase tracking-[0.2em] text-slate-600 font-black mb-4">Description</h4>
              <div className="text-[13px] text-slate-400 leading-relaxed bg-white/[0.02] p-5 rounded-xl border border-white/5 font-medium">
                {node.description || "No analytical description available for this node."}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 gap-3 mb-10">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <Calendar size={14} className="text-slate-600" />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600 font-black">Created</p>
                  <p className="text-xs text-slate-300 font-medium">March 17, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <User size={14} className="text-slate-600" />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600 font-black">Author</p>
                  <p className="text-xs text-slate-300 font-medium">System Lab</p>
                </div>
              </div>
            </div>

            {/* Connections Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-[9px] uppercase tracking-[0.2em] text-slate-600 font-black">Relational Map</h4>
                <span className="text-[9px] text-indigo-500 font-black tracking-widest">3 NODES</span>
              </div>
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <Link2 size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      <span className="text-[12px] text-slate-400 group-hover:text-slate-200 transition-colors font-medium">Logical Block {i}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-700 group-hover:text-white transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div className="mb-10">
              <h4 className="text-[9px] uppercase tracking-[0.2em] text-slate-600 font-black mb-4">Internal Notes</h4>
              <div className="relative">
                <textarea 
                  className="w-full h-40 bg-white/[0.02] border border-white/5 rounded-xl p-5 text-[13px] text-slate-400 focus:outline-none focus:border-indigo-500/30 transition-all resize-none font-medium placeholder:text-slate-700"
                  placeholder="Append analytical observations..."
                />
                <MessageSquare size={14} className="absolute bottom-5 right-5 text-slate-700" />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-white/5 bg-white/[0.02] flex gap-3">
            <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-indigo-600/20">
              Edit Content
            </button>
            <button className="p-4 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-xl transition-all border border-white/5">
              <ExternalLink size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
